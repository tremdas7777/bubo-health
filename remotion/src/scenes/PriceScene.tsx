import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const PriceScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [70, 85], [1, 0], { extrapolateRight: "clamp" });

  const deScale = spring({ frame, fps, config: { damping: 20 } });
  const strikeWidth = interpolate(frame, [12, 25], [0, 100], { extrapolateRight: "clamp" });
  const porScale = spring({ frame: frame - 20, fps, config: { damping: 8, stiffness: 200 } });
  const saveScale = spring({ frame: frame - 35, fps, config: { damping: 10 } });
  const glowIntensity = 0.3 + Math.sin(frame * 0.15) * 0.2;

  const imgScale = spring({ frame: frame - 3, fps, config: { damping: 15 } });
  const imgFloat = Math.sin(frame * 0.06) * 4;

  const priceCountEnd = Math.min(frame - 20, 15);
  const displayPrice = priceCountEnd < 0 ? 997 : priceCountEnd >= 15 ? 497 : Math.round(997 - (500 * (priceCountEnd / 15)));

  return (
    <AbsoluteFill style={{ opacity: enterOpacity * exitOpacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>

      {/* Small product square - top right */}
      <div
        style={{
          position: "absolute",
          top: 120,
          right: 60,
          width: 260,
          height: 260,
          borderRadius: 20,
          overflow: "hidden",
          border: "3px solid rgba(132,204,22,0.4)",
          boxShadow: "0 0 40px rgba(132,204,22,0.2), 0 10px 30px rgba(0,0,0,0.4)",
          transform: `scale(${imgScale}) translateY(${imgFloat}px)`,
        }}
      >
        <Img src={staticFile("images/product-1.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Old price */}
      <div style={{ position: "relative", display: "inline-block", transform: `scale(${deScale})`, marginBottom: 20 }}>
        <span style={{ fontSize: 56, color: "rgba(255,255,255,0.35)", fontWeight: 600, fontFamily: "sans-serif" }}>
          De R$ 997,00
        </span>
        <div style={{ position: "absolute", top: "50%", left: 0, height: 5, width: `${strikeWidth}%`, background: "#EF4444", borderRadius: 3, transform: "rotate(-3deg)" }} />
      </div>

      {/* Arrow */}
      <div style={{ fontSize: 70, color: "#84CC16", margin: "10px 0", opacity: interpolate(frame, [18, 24], [0, 1], { extrapolateRight: "clamp" }) }}>↓</div>

      {/* New price */}
      <div style={{ transform: `scale(${porScale})`, textAlign: "center", textShadow: `0 0 ${80 * glowIntensity}px rgba(132,204,22,${glowIntensity})` }}>
        <span style={{ fontSize: 38, color: "rgba(255,255,255,0.6)", fontWeight: 500, fontFamily: "sans-serif" }}>Por apenas</span>
        <div style={{ fontSize: 150, fontWeight: 900, fontFamily: "sans-serif", background: "linear-gradient(135deg, #84CC16, #A3E635)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginTop: 5 }}>
          R$ {displayPrice}
        </div>
        <span style={{ fontSize: 32, color: "rgba(255,255,255,0.5)", fontWeight: 400, fontFamily: "sans-serif" }}>ou 6x de R$ 93,07</span>
      </div>

      {/* Savings badge */}
      <div style={{ marginTop: 50, background: "linear-gradient(135deg, #7C3AED, #9333EA)", color: "white", fontSize: 34, fontWeight: 800, fontFamily: "sans-serif", padding: "18px 48px", borderRadius: 60, transform: `scale(${saveScale})`, boxShadow: "0 8px 40px rgba(124,58,237,0.4)", textAlign: "center" }}>
        🔥 ECONOMIA DE R$ 500
      </div>

      {/* Trust badges */}
      <div style={{ marginTop: 40, display: "flex", gap: 30, opacity: interpolate(frame, [45, 55], [0, 0.7], { extrapolateRight: "clamp" }) }}>
        {["🔒 Compra Segura", "📦 Envio 24h"].map((badge, i) => (
          <span key={i} style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", fontWeight: 500 }}>{badge}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
