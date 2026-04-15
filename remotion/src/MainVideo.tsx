import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ShowcaseScene } from "./scenes/ShowcaseScene";
import { PriceScene } from "./scenes/PriceScene";
import { CTAScene } from "./scenes/CTAScene";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  const bgHue = interpolate(frame, [0, 300], [260, 280]);
  const bgGrad = `linear-gradient(180deg, hsl(${bgHue}, 60%, 8%) 0%, hsl(${bgHue + 20}, 50%, 14%) 50%, hsl(${bgHue}, 70%, 6%) 100%)`;

  return (
    <AbsoluteFill style={{ background: bgGrad }}>
      <PersistentAccents frame={frame} />

      <Sequence from={0} durationInFrames={75}>
        <HookScene />
      </Sequence>

      <Sequence from={65} durationInFrames={115}>
        <ShowcaseScene />
      </Sequence>

      <Sequence from={170} durationInFrames={85}>
        <PriceScene />
      </Sequence>

      <Sequence from={245} durationInFrames={55}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

function PersistentAccents({ frame }: { frame: number }) {
  const y1 = Math.sin(frame * 0.02) * 30;
  const y2 = Math.cos(frame * 0.015) * 40;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 150 + y1,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200 + y2,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132,204,22,0.12) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
