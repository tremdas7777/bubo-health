import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

const IMAGES = Array.from({ length: 8 }, (_, i) => staticFile(`images/product-${i}.webp`));

export const ShowcaseScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter fade
  const enterOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  // Exit fade
  const exitOpacity = interpolate(frame, [105, 120], [1, 0], { extrapolateRight: "clamp" });

  // Title slide in
  const titleX = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 150 } }),
    [0, 1],
    [-400, 0]
  );

  // Cycle through images
  const imageIndex = Math.floor(frame / 18) % IMAGES.length;

  // Image zoom
  const imgProgress = (frame % 18) / 18;
  const imgScale = interpolate(imgProgress, [0, 0.1, 0.9, 1], [0.8, 1.05, 1.05, 1], {
    extrapolateRight: "clamp",
  });
  const imgOpacity = interpolate(imgProgress, [0, 0.08, 0.85, 1], [0, 1, 1, 0.5], {
    extrapolateRight: "clamp",
  });

  // Badge bounce
  const badgeScale = spring({ frame: frame - 10, fps, config: { damping: 8 } });

  // Feature bullets stagger
  const features = [
    "Bomba de Vácuo 7 CFM",
    "2 Manifolds Completos",
    "Maçarico até 1.200°C",
    "18 Ferramentas Profissionais",
  ];

  return (
    <AbsoluteFill style={{ opacity: enterOpacity * exitOpacity }}>
      {/* Left side - product image */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 800,
          height: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 650,
            height: 650,
            borderRadius: 30,
            overflow: "hidden",
            border: "3px solid rgba(124,58,237,0.4)",
            boxShadow: "0 0 80px rgba(124,58,237,0.3)",
            transform: `scale(${imgScale})`,
            opacity: imgOpacity,
          }}
        >
          <Img
            src={IMAGES[imageIndex]}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* 50% OFF badge */}
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 50,
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "white",
            fontSize: 32,
            fontWeight: 900,
            fontFamily: "sans-serif",
            padding: "16px 28px",
            borderRadius: 16,
            transform: `scale(${badgeScale}) rotate(-8deg)`,
            boxShadow: "0 8px 30px rgba(239,68,68,0.5)",
          }}
        >
          -50% OFF
        </div>
      </div>

      {/* Right side - text */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: `translateY(-50%) translateX(${titleX}px)`,
          width: 850,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#84CC16",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 16,
          }}
        >
          Kit Completo Profissional
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1.1,
            marginBottom: 40,
          }}
        >
          Refrigeração &{"\n"}Ar Condicionado
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {features.map((feat, i) => {
            const featProgress = spring({
              frame: frame - 20 - i * 8,
              fps,
              config: { damping: 15 },
            });
            const featX = interpolate(featProgress, [0, 1], [100, 0]);
            const featOp = interpolate(featProgress, [0, 1], [0, 1]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: featOp,
                  transform: `translateX(${featX}px)`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #9333EA)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "white",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: 30,
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 500,
                    fontFamily: "sans-serif",
                  }}
                >
                  {feat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
