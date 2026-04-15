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

  // Product image
  const imgScale = spring({ frame, fps, config: { damping: 12 } });
  const imgFloat = Math.sin(frame * 0.1) * 6;

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity,
      }}
    >
      {/* Product image - prominent at top */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: "50%",
          transform: `translateX(-50%) scale(${imgScale}) translateY(${imgFloat}px)`,
          width: 420,
          height: 420,
          borderRadius: 24,
          overflow: "hidden",
          border: "3px solid rgba(132,204,22,0.5)",
          boxShadow: "0 0 80px rgba(132,204,22,0.25), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Img
          src={staticFile("images/product-0.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* -50% badge on image */}
        <div
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "white",
            fontSize: 28,
            fontWeight: 900,
            fontFamily: "sans-serif",
            padding: "10px 18px",
            borderRadius: 14,
            transform: "rotate(-8deg)",
            boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
          }}
        >
          -50%
        </div>
      </div>

      {/* Content below image */}
      <div
        style={{
          position: "absolute",
          top: 600,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 60px",
        }}
      >
        {/* Urgency */}
        <div
          style={{
            fontSize: 34,
            color: "#EF4444",
            fontWeight: 800,
            fontFamily: "sans-serif",
            opacity: urgencyOp,
            transform: `translateY(${urgencyY}px)`,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          ⚡ ÚLTIMAS UNIDADES ⚡
        </div>

        {/* Price reminder */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            fontFamily: "sans-serif",
            background: "linear-gradient(135deg, #84CC16, #A3E635)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 30,
            opacity: urgencyOp,
          }}
        >
          R$ 497
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
            padding: "32px 70px",
            borderRadius: 24,
            transform: `scale(${btnScale * pulse})`,
            boxShadow: "0 10px 60px rgba(132,204,22,0.45), 0 0 120px rgba(132,204,22,0.15)",
            letterSpacing: 3,
            textAlign: "center",
          }}
        >
          COMPRE AGORA
        </div>

        {/* Benefits */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: urgencyOp,
          }}
        >
          {["🚚 Frete Grátis", "📦 Envio Imediato", "🔄 7 Dias Garantia"].map((text, i) => (
            <span
              key={i}
              style={{
                fontSize: 26,
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
            marginTop: 40,
            fontSize: 44,
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
