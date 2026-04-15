import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const CTAScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // CTA button scale with pulse
  const btnScale = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });
  const pulse = 1 + Math.sin(frame * 0.3) * 0.03;

  // Urgency text
  const urgencyOp = interpolate(frame, [10, 20], [0, 1], { extrapolateRight: "clamp" });
  const urgencyY = interpolate(frame, [10, 20], [20, 0], { extrapolateRight: "clamp" });

  // Logo/brand
  const brandOp = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Urgency */}
        <div
          style={{
            fontSize: 32,
            color: "#EF4444",
            fontWeight: 700,
            fontFamily: "sans-serif",
            opacity: urgencyOp,
            transform: `translateY(${urgencyY}px)`,
            marginBottom: 24,
          }}
        >
          ⚡ OFERTA POR TEMPO LIMITADO ⚡
        </div>

        {/* CTA Button */}
        <div
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #84CC16, #65A30D)",
            color: "#0F172A",
            fontSize: 52,
            fontWeight: 900,
            fontFamily: "sans-serif",
            padding: "28px 80px",
            borderRadius: 20,
            transform: `scale(${btnScale * pulse})`,
            boxShadow: "0 10px 50px rgba(132,204,22,0.4), 0 0 100px rgba(132,204,22,0.15)",
            letterSpacing: 2,
          }}
        >
          COMPRE AGORA
        </div>

        {/* Frete grátis badge */}
        <div
          style={{
            marginTop: 30,
            fontSize: 26,
            color: "rgba(255,255,255,0.8)",
            fontWeight: 600,
            fontFamily: "sans-serif",
            opacity: urgencyOp,
          }}
        >
          🚚 Frete Grátis • 📦 Envio Imediato
        </div>

        {/* Brand */}
        <div
          style={{
            marginTop: 40,
            fontSize: 40,
            fontWeight: 900,
            fontFamily: "sans-serif",
            opacity: brandOp,
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          KAZOOM
        </div>
      </div>
    </AbsoluteFill>
  );
};
