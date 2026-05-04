import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const CTAScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const btnScale = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 150 } });
  const pulse = 1 + Math.sin(frame * 0.35) * 0.04;
  const urgencyOp = interpolate(frame, [8, 16], [0, 1], { extrapolateRight: "clamp" });
  const urgencyY = interpolate(frame, [8, 16], [30, 0], { extrapolateRight: "clamp" });
  const brandOp = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });
  const countdownOp = interpolate(frame, [20, 28], [0, 1], { extrapolateRight: "clamp" });

  const imgScale = spring({ frame, fps, config: { damping: 12 } });
  const imgFloat = Math.sin(frame * 0.1) * 4;

  return (
    <AbsoluteFill style={{ opacity: enterOpacity }}>

      {/* Small product square - top left */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 60,
          width: 260,
          height: 260,
          borderRadius: 20,
          overflow: "hidden",
          border: "3px solid rgba(132,204,22,0.5)",
          boxShadow: "0 0 40px rgba(132,204,22,0.2), 0 10px 30px rgba(0,0,0,0.4)",
          transform: `scale(${imgScale}) translateY(${imgFloat}px)`,
        }}
      >
        <Img src={staticFile("images/product-0.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "white", fontSize: 20, fontWeight: 900, fontFamily: "sans-serif", padding: "6px 12px", borderRadius: 10, transform: "rotate(-8deg)" }}>
          -50%
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "absolute", top: 480, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 60px" }}>
        {/* Urgency */}
        <div style={{ fontSize: 36, color: "#EF4444", fontWeight: 800, fontFamily: "sans-serif", opacity: urgencyOp, transform: `translateY(${urgencyY}px)`, marginBottom: 30, textAlign: "center" }}>
          ⚡ ÚLTIMAS UNIDADES ⚡
        </div>

        {/* Price */}
        <div style={{ fontSize: 70, fontWeight: 900, fontFamily: "sans-serif", background: "linear-gradient(135deg, #84CC16, #A3E635)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 30, opacity: urgencyOp }}>
          R$ 497
        </div>

        {/* CTA Button */}
        <div style={{ display: "inline-block", background: "linear-gradient(135deg, #84CC16, #65A30D)", color: "#0F172A", fontSize: 58, fontWeight: 900, fontFamily: "sans-serif", padding: "36px 80px", borderRadius: 24, transform: `scale(${btnScale * pulse})`, boxShadow: "0 10px 60px rgba(132,204,22,0.45), 0 0 120px rgba(132,204,22,0.15)", letterSpacing: 3, textAlign: "center" }}>
          COMPRE{"\n"}AGORA
        </div>

        {/* Benefits */}
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: urgencyOp }}>
          {["🚚 Frete Grátis", "📦 Envio Imediato", "🔄 7 Dias Garantia"].map((text, i) => (
            <span key={i} style={{ fontSize: 30, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontFamily: "sans-serif" }}>{text}</span>
          ))}
        </div>

        {/* Brand */}
        <div style={{ marginTop: 50, fontSize: 50, fontWeight: 900, fontFamily: "sans-serif", opacity: brandOp, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Bubo Health
        </div>
      </div>

      {/* Swipe up */}
      <div style={{ position: "absolute", bottom: 80, left: "50%", transform: `translateX(-50%) translateY(${Math.sin(frame * 0.2) * 8}px)`, opacity: countdownOp * 0.6, fontSize: 22, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", textAlign: "center" }}>
        ↑ Link na descrição
      </div>
    </AbsoluteFill>
  );
};
