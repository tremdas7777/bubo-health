import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "PARE" text slam
  const pareScale = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
  const pareOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  // "de comprar ferramentas avulsas!" fade in
  const subOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [15, 30], [40, 0], { extrapolateRight: "clamp" });

  // Red X marks
  const xScale = spring({ frame: frame - 25, fps, config: { damping: 12 } });

  // Flash effect at start
  const flashOpacity = interpolate(frame, [0, 8], [0.6, 0], { extrapolateRight: "clamp" });

  // Exit fade
  const exitOpacity = interpolate(frame, [65, 80], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Flash */}
      <AbsoluteFill style={{ background: "white", opacity: flashOpacity }} />

      {/* Main text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pareScale})`,
          opacity: pareOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "#EF4444",
            fontFamily: "sans-serif",
            letterSpacing: -3,
            textShadow: "0 0 60px rgba(239,68,68,0.5)",
          }}
        >
          PARE!
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: "white",
            fontFamily: "sans-serif",
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 10,
          }}
        >
          de comprar ferramentas avulsas
        </div>
      </div>

      {/* Scattered red X marks for emphasis */}
      {[
        { x: 200, y: 200 },
        { x: 1600, y: 250 },
        { x: 300, y: 750 },
        { x: 1550, y: 800 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            fontSize: 80,
            color: "rgba(239,68,68,0.3)",
            fontWeight: 900,
            fontFamily: "sans-serif",
            transform: `scale(${spring({ frame: frame - 25 - i * 3, fps, config: { damping: 10 } })}) rotate(${i * 15 - 20}deg)`,
          }}
        >
          ✕
        </div>
      ))}
    </AbsoluteFill>
  );
};
