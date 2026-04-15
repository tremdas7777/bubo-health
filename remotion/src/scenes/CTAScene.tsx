import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const CTAScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const btnScale = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });
  const pulse = 1 + Math.sin(frame * 0.35) * 0.04;
  const urgencyOp = interpolate(frame, [8, 16], [0, 1], { extrapolateRight: "clamp" });
  const urgencyY = interpolate(frame, [8, 16], [30, 0], { extrapolateRight: "clamp" });
  const brandOp = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });

  // Countdown urgency
  const countdownOp = interpolate(frame, [20, 28], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      {/* Urgency */}
      <div
        style={{
          fontSize: 36,
          color: "#EF4444",
          fontWeight: 800,
          fontFamily: "sans-serif",
          opacity: urgencyOp,
          transform: `translateY(${urgencyY}px)`,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        ⚡ ÚLTIMAS UNIDADES ⚡
      </div>

      {/* CTA Button */}
      <div
        style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #84CC16, #65A30D)",
          color: "#0F172A",
          fontSize: 58,
          fontWeight: 900,
          fontFamily: "sans-serif",
          padding: "36px 80px",
          borderRadius: 24,
          transform: `scale(${btnScale * pulse})`,
          boxShadow: "0 10px 60px rgba(132,204,22,0.45), 0 0 120px rgba(132,204,22,0.15)",
          letterSpacing: 3,
          textAlign: "center",
        }}
      >
        COMPRE{"\n"}AGORA
      </div>

      {/* Benefits */}
      <div
        style={{
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: urgencyOp,
        }}
      >
        {["🚚 Frete Grátis", "📦 Envio Imediato", "🔄 7 Dias Garantia"].map((text, i) => (
          <span
            key={i}
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            {text}
          </span>
        ))}
      </div>

      {/* Brand */}
      <div
        style={{
          marginTop: 60,
          fontSize: 50,
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

      {/* Swipe up indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: `translateX(-50%) translateY(${Math.sin(frame * 0.2) * 8}px)`,
          opacity: countdownOp * 0.6,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        ↑ Link na descrição
      </div>
    </AbsoluteFill>
  );
};
