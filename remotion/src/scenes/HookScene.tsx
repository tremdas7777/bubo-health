import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pareScale = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
  const pareOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [12, 25], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [12, 25], [50, 0], { extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [0, 6], [0.7, 0], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [60, 75], [1, 0], { extrapolateRight: "clamp" });

  // Product image animation
  const imgScale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 150 } });
  const imgFloat = Math.sin(frame * 0.08) * 8;

  // Shake effect
  const shakeX = frame < 10 ? Math.sin(frame * 8) * (10 - frame) : 0;

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <AbsoluteFill style={{ background: "white", opacity: flashOpacity }} />

      {/* Product image - always visible at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: "50%",
          transform: `translateX(-50%) scale(${imgScale}) translateY(${imgFloat}px)`,
          width: 550,
          height: 550,
          borderRadius: 24,
          overflow: "hidden",
          border: "3px solid rgba(124,58,237,0.4)",
          boxShadow: "0 0 80px rgba(124,58,237,0.3), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Img
          src={staticFile("images/product-0.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Text overlay on top */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pareScale}) translateX(${shakeX}px)`,
          opacity: pareOpacity,
          textAlign: "center",
          width: "90%",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: "#EF4444",
            fontFamily: "sans-serif",
            letterSpacing: -4,
            textShadow: "0 0 80px rgba(239,68,68,0.6)",
          }}
        >
          PARE!
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "white",
            fontFamily: "sans-serif",
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 20,
            lineHeight: 1.3,
          }}
        >
          de comprar ferramentas{"\n"}avulsas! 💸
        </div>
      </div>

      {/* Urgency emoji burst */}
      {["🔧", "⚡", "🔩", "💰"].map((emoji, i) => {
        const s = spring({ frame: frame - 8 - i * 4, fps, config: { damping: 8 } });
        const angle = (i * 90 + 45) * (Math.PI / 180);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${15 + Math.sin(angle) * 12}%`,
              left: `${50 + Math.cos(angle) * 25}%`,
              fontSize: 60,
              transform: `scale(${s}) rotate(${i * 20 - 30}deg)`,
              opacity: s,
              zIndex: 3,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
