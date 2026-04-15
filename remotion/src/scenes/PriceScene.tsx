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

  // Product image
  const imgScale = spring({ frame: frame - 3, fps, config: { damping: 15 } });
  const imgFloat = Math.sin(frame * 0.06) * 6;

  // Counting animation for price
  const priceCountEnd = Math.min(frame - 20, 15);
  const displayPrice = priceCountEnd < 0 ? 997 : 
    priceCountEnd >= 15 ? 497 : 
    Math.round(997 - (500 * (priceCountEnd / 15)));

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity * exitOpacity,
      }}
    >
      {/* Product image - top half */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: `translateX(-50%) scale(${imgScale}) translateY(${imgFloat}px)`,
          width: 480,
          height: 480,
          borderRadius: 24,
          overflow: "hidden",
          border: "3px solid rgba(132,204,22,0.4)",
          boxShadow: "0 0 60px rgba(132,204,22,0.2), 0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <Img
          src={staticFile("images/product-1.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Price section - bottom half */}
      <div
        style={{
          position: "absolute",
          top: 650,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 60px",
        }}
      >
        {/* Old price */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            transform: `scale(${deScale})`,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 48,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            De R$ 997,00
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 5,
              width: `${strikeWidth}%`,
              background: "#EF4444",
              borderRadius: 3,
              transform: "rotate(-3deg)",
            }}
          />
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 50,
            color: "#84CC16",
            margin: "5px 0",
            opacity: interpolate(frame, [18, 24], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          ↓
        </div>

        {/* New price */}
        <div
          style={{
            transform: `scale(${porScale})`,
            textAlign: "center",
            textShadow: `0 0 ${80 * glowIntensity}px rgba(132,204,22,${glowIntensity})`,
          }}
        >
          <span
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
              fontFamily: "sans-serif",
            }}
          >
            Por apenas
          </span>
          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontFamily: "sans-serif",
              background: "linear-gradient(135deg, #84CC16, #A3E635)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginTop: 5,
            }}
          >
            R$ {displayPrice}
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
            background: "linear-gradient(135deg, #7C3AED, #9333EA)",
            color: "white",
            fontSize: 30,
            fontWeight: 800,
            fontFamily: "sans-serif",
            padding: "14px 40px",
            borderRadius: 60,
            transform: `scale(${saveScale})`,
            boxShadow: "0 8px 40px rgba(124,58,237,0.4)",
            textAlign: "center",
          }}
        >
          🔥 ECONOMIA DE R$ 500
        </div>

        {/* Trust badges */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 30,
            opacity: interpolate(frame, [45, 55], [0, 0.7], { extrapolateRight: "clamp" }),
          }}
        >
          {["🔒 Compra Segura", "📦 Envio 24h"].map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                fontWeight: 500,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
