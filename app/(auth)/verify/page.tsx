export default function VerifyPage() {
  return (
    <div
      style={{
        background: "rgba(10,10,24,0.97)",
        border: "1px solid rgba(0,229,255,0.2)",
        borderRadius: "2px",
        padding: "3rem 2.5rem",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 0 60px rgba(0,0,0,0.9)",
      }}
    >
      <span style={{ position:"absolute",top:-1,left:-1,width:16,height:16,borderTop:"2px solid #00e5ff",borderLeft:"2px solid #00e5ff" }} />
      <span style={{ position:"absolute",bottom:-1,right:-1,width:16,height:16,borderBottom:"2px solid #00e5ff",borderRight:"2px solid #00e5ff" }} />

      <div style={{ fontSize:"2.5rem",marginBottom:"1rem" }}>◉</div>
      <h1 style={{ fontSize:"1.1rem",fontWeight:700,color:"#00e5ff",letterSpacing:"0.15em",textTransform:"uppercase",textShadow:"0 0 10px rgba(0,229,255,0.6)",marginBottom:"1rem" }}>
        查看你的邮箱
      </h1>
      <p style={{ fontSize:"0.875rem",color:"rgba(74,85,128,0.9)",lineHeight:1.6 }}>
        我们发送了一个登录链接到你的邮箱。<br />点击链接即可登录，无需密码。
      </p>
      <p style={{ fontSize:"0.7rem",color:"rgba(74,85,128,0.5)",marginTop:"1.5rem",letterSpacing:"0.1em" }}>
        链接将在 24 小时后失效
      </p>
    </div>
  );
}
