import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, staticFile } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ShowcaseScene } from "./scenes/ShowcaseScene";
import { PriceScene } from "./scenes/PriceScene";
import { CTAScene } from "./scenes/CTAScene";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent animated background
  const bgHue = interpolate(frame, [0, 300], [260, 280]);
  const bgGrad = `linear-gradient(135deg, hsl(${bgHue}, 60%, 8%) 0%, hsl(${bgHue + 20}, 50%, 12%) 50%, hsl(${bgHue}, 70%, 6%) 100%)`;

  return (
    <AbsoluteFill style={{ background: bgGrad }}>
      {/* Floating accent shapes */}
      <PersistentAccents frame={frame} />

      {/* Scene 1: Hook (0-80) */}
      <Sequence from={0} durationInFrames={80}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Product Showcase (70-190) */}
      <Sequence from={70} durationInFrames={120}>
        <ShowcaseScene />
      </Sequence>

      {/* Scene 3: Price Anchor (180-260) */}
      <Sequence from={180} durationInFrames={80}>
        <PriceScene />
      </Sequence>

      {/* Scene 4: CTA (250-300) */}
      <Sequence from={250} durationInFrames={50}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

function PersistentAccents({ frame }: { frame: number }) {
  const y1 = Math.sin(frame * 0.02) * 30;
  const y2 = Math.cos(frame * 0.015) * 40;
  const x1 = Math.cos(frame * 0.01) * 20;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 80 + y1,
          right: 60 + x1,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 100 + y2,
          left: 80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132,204,22,0.15) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
