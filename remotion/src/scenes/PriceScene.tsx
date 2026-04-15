import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const PriceScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [65, 80], [1, 0], { extrapolateRight: "clamp" });

  // "De" price with strikethrough
  const deScale = spring({ frame, fps, config: { damping: 20 } });

  // Strikethrough line animation
  const strikeWidth = interpolate(frame, [15, 30], [0, 100], { extrapolateRight: "clamp" });

  // "Por" price slam
  const porScale = spring({ frame: frame - 25, fps, config: { damping: 8, stiffness: 200 } });

  // Savings badge
  const saveScale = spring({ frame: frame - 40, fps, config: { damping: 10 } });

  // Pulsing glow on price
  const glowIntensity = 0.3 + Math.sin(frame * 0.15) * 0.15;

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity * exitOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Old price */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            transform: `scale(${deScale})`,
          }}
        >
          <span
            style={{
              fontSize: 50,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            De R$ 997,00
          </span>
          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 4,
              width: `${strikeWidth}%`,
              background: "#EF4444",
              borderRadius: 2,
              transform: "rotate(-3deg)",
            }}
          />
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 60,
            color: "#84CC16",
            margin: "10px 0",
            opacity: interpolate(frame, [20, 28], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          ↓
        </div>

        {/* New price */}
        <div
          style={{
            transform: `scale(${porScale})`,
            textShadow: `0 0 ${60 * glowIntensity}px rgba(132,204,22,${glowIntensity})`,
          }}
        >
          <span
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              fontFamily: "sans-serif",
            }}
          >
            Por apenas
          </span>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              fontFamily: "sans-serif",
              background: "linear-gradient(135deg, #84CC16, #A3E635)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginTop: 5,
            }}
          >
            R$ 497
          </div>
          <span
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 400,
              fontFamily: "sans-serif",
            }}
          >
            ou 6x de R$ 93,07
          </span>
        </div>

        {/* Savings badge */}
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            background: "linear-gradient(135deg, #7C3AED, #9333EA)",
            color: "white",
            fontSize: 28,
            fontWeight: 800,
            fontFamily: "sans-serif",
            padding: "14px 40px",
            borderRadius: 60,
            transform: `scale(${saveScale})`,
            boxShadow: "0 8px 40px rgba(124,58,237,0.4)",
          }}
        >
          🔥 ECONOMIA DE R$ 500
        </div>
      </div>
    </AbsoluteFill>
  );
};
