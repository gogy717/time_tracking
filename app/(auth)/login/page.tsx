"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google 登录启动失败，请重试");
      setGoogleLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError("");
    try {
      await signIn("resend", { email, callbackUrl: "/dashboard" });
      setSent(true);
    } catch {
      setError("登录链接发送失败，请重试");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(10,10,24,0.97)",
        border: "1px solid rgba(0,229,255,0.2)",
        borderRadius: "2px",
        padding: "2.5rem",
        boxShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 40px rgba(0,229,255,0.04)",
        position: "relative",
      }}
    >
      {/* Corner brackets */}
      <span style={{ position:"absolute",top:-1,left:-1,width:16,height:16,borderTop:"2px solid #00e5ff",borderLeft:"2px solid #00e5ff" }} />
      <span style={{ position:"absolute",top:-1,right:-1,width:16,height:16,borderTop:"2px solid #00e5ff",borderRight:"2px solid #00e5ff" }} />
      <span style={{ position:"absolute",bottom:-1,left:-1,width:16,height:16,borderBottom:"2px solid #00e5ff",borderLeft:"2px solid #00e5ff" }} />
      <span style={{ position:"absolute",bottom:-1,right:-1,width:16,height:16,borderBottom:"2px solid #00e5ff",borderRight:"2px solid #00e5ff" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize:"0.65rem",letterSpacing:"0.4em",color:"rgba(0,229,255,0.4)",textTransform:"uppercase",marginBottom:"0.75rem" }}>
          SYSTEM ACCESS
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#00e5ff",
            textShadow: "0 0 15px rgba(0,229,255,0.7), 0 0 30px rgba(0,229,255,0.3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          时间追踪
        </h1>
        <div style={{ height:1,background:"linear-gradient(90deg,transparent,rgba(0,229,255,0.4),transparent)",margin:"0.75rem 0 0" }} />
        <p style={{ fontSize:"0.8rem",color:"rgba(74,85,128,0.9)",marginTop:"0.75rem",letterSpacing:"0.05em" }}>
          登录以开始记录你的专注时间
        </p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading || emailLoading}
        style={{
          width:"100%",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          gap:"0.75rem",
          padding:"0.7rem 1rem",
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:"2px",
          color:"#dde4ff",
          fontSize:"0.875rem",
          fontWeight:500,
          cursor: googleLoading || emailLoading ? "wait" : "pointer",
          opacity: googleLoading || emailLoading ? 0.65 : 1,
          letterSpacing:"0.05em",
          transition:"all 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.4)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 15px rgba(0,229,255,0.08)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        <GoogleIcon />
        {googleLoading ? "正在连接 Google..." : "使用 Google 登录"}
      </button>

      {/* Divider */}
      <div style={{ position:"relative",margin:"1.5rem 0",display:"flex",alignItems:"center" }}>
        <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }} />
        <span style={{ padding:"0 0.75rem",fontSize:"0.7rem",color:"rgba(74,85,128,0.6)",letterSpacing:"0.2em" }}>OR</span>
        <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }} />
      </div>

      {/* Email */}
      {sent ? (
        <div style={{ textAlign:"center",padding:"1rem",border:"1px solid rgba(0,229,255,0.15)",borderRadius:"2px",background:"rgba(0,229,255,0.03)" }}>
          <div style={{ fontSize:"0.9rem",color:"#00e5ff",marginBottom:"0.25rem" }}>◉ 链接已发送</div>
          <p style={{ fontSize:"0.8rem",color:"rgba(74,85,128,0.8)" }}>
            请查看 <strong style={{ color:"#dde4ff" }}>{email}</strong> 的邮箱
          </p>
        </div>
      ) : (
        <form onSubmit={handleEmailSignIn} style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={emailLoading || googleLoading}
            required
            style={{
              width:"100%",
              padding:"0.7rem 0.875rem",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:"2px",
              color:"#dde4ff",
              fontSize:"0.875rem",
              letterSpacing:"0.02em",
              transition:"border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <button
            type="submit"
            disabled={emailLoading || googleLoading}
            style={{
              padding:"0.7rem 1rem",
              background: emailLoading ? "rgba(0,229,255,0.1)" : "rgba(0,229,255,0.15)",
              border:"1px solid rgba(0,229,255,0.4)",
              borderRadius:"2px",
              color:"#00e5ff",
              fontSize:"0.875rem",
              fontWeight:600,
              letterSpacing:"0.1em",
              textTransform:"uppercase",
              cursor: emailLoading || googleLoading ? "not-allowed" : "pointer",
              opacity: emailLoading || googleLoading ? 0.6 : 1,
              textShadow:"0 0 8px rgba(0,229,255,0.5)",
              boxShadow:"0 0 15px rgba(0,229,255,0.1)",
              transition:"all 0.2s",
            }}
          >
            {emailLoading ? "发送中..." : "发送登录链接"}
          </button>
        </form>
      )}
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#ff1744", marginTop: "0.75rem", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg style={{ width:16,height:16,flexShrink:0 }} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
