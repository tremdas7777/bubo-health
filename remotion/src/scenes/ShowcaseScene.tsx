import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

const IMAGES = Array.from({ length: 8 }, (_, i) => staticFile(`images/product-${i}.webp`));

export const ShowcaseScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [100, 115], [1, 0], { extrapolateRight: "clamp" });

  const imageIndex = Math.floor(frame / 15) % IMAGES.length;
  const imgProgress = (frame % 15) / 15;
  const imgScale = interpolate(imgProgress, [0, 0.08, 0.85, 1], [0.85, 1.05, 1.05, 1]);
  const imgOpacity = interpolate(imgProgress, [0, 0.06, 0.8, 1], [0, 1, 1, 0.3]);

  const badgeScale = spring({ frame: frame - 8, fps, config: { damping: 8 } });

  const features = [
    "✅ Bomba de Vácuo 7 CFM",
    "✅ 2 Manifolds Completos",
    "✅ Maçarico 1.200°C",
    "✅ 18 Ferramentas Pro",
    "✅ Maleta Reforçada",
  ];

  return (
    <AbsoluteFill style={{ opacity: enterOpacity * exitOpacity }}>
      {/* Top label */}
      <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#84CC16", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 5, background: "rgba(132,204,22,0.1)", padding: "8px 24px", borderRadius: 8, border: "1px solid rgba(132,204,22,0.3)" }}>
          Kit Completo Profissional
        </span>
      </div>

      {/* Small product square - cycling images */}
      <div style={{ position: "absolute", top: 200, left: "50%", transform: "translateX(-50)" }}>
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 20,
            overflow: "hidden",
            border: "3px solid rgba(124,58,237,0.4)",
            boxShadow: "0 0 40px rgba(124,58,237,0.2), 0 10px 30px rgba(0,0,0,0.4)",
            transform: `scale(${imgScale})`,
            opacity: imgOpacity,
          }}
        >
          <Img src={IMAGES[imageIndex]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* -50% badge */}
        <div
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "white",
            fontSize: 28,
            fontWeight: 900,
            fontFamily: "sans-serif",
            padding: "10px 18px",
            borderRadius: 14,
            transform: `scale(${badgeScale}) rotate(-10deg)`,
            boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
          }}
        >
          -50%
        </div>
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", padding: "0 40px" }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: "white", fontFamily: "sans-serif", lineHeight: 1.15, marginBottom: 30 }}>
          Refrigeração &{"\n"}Ar Condicionado
        </div>
      </div>

      {/* Feature list */}
      <div style={{ position: "absolute", top: 720, width: "100%", padding: "0 80px", display: "flex", flexDirection: "column", gap: 18 }}>
        {features.map((feat, i) => {
          const p = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ fontSize: 36, color: "rgba(255,255,255,0.9)", fontWeight: 600, fontFamily: "sans-serif", opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateX(${interpolate(p, [0, 1], [80, 0])}px)` }}>
              {feat}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
