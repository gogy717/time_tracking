export default function VerifyPage() {
  return (
    <div
      style={{
        background: "rgba(255,253,248,0.92)",
        border: "1px solid rgba(110,92,70,0.12)",
        borderRadius: "24px",
        padding: "3rem 2.5rem",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 22px 60px rgba(115,94,64,0.12)",
      }}
    >
      <div style={{ fontSize:"2.5rem",marginBottom:"1rem",color:"#548373" }}>●</div>
      <h1 style={{ fontSize:"1.1rem",fontWeight:800,color:"#2f2a24",letterSpacing: 0,marginBottom:"1rem" }}>
        查看你的邮箱
      </h1>
      <p style={{ fontSize:"0.875rem",color:"#7a6c5d",lineHeight:1.6 }}>
        我们发送了一个登录链接到你的邮箱。<br />点击链接即可登录，无需密码。
      </p>
      <p style={{ fontSize:"0.7rem",color:"#a29382",marginTop:"1.5rem",letterSpacing: 0 }}>
        链接将在 24 小时后失效
      </p>
    </div>
  );
}
