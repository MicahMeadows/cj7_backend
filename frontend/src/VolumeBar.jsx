import React from "react";

export default function VolumeBar({ value = 0, bgColor = "#333", accentColor = "#0f0" }) {
  // Clamp value between 0 and 15
  const clampedValue = Math.max(0, Math.min(15, value));
  const fillPercent = (clampedValue / 15) * 100;

  return (
    <div
      style={{
        position: "relative",
        height: "24px",
        border: `3px solid ${accentColor}`,
        background: bgColor,
        overflow: "hidden",
        // width: "200px",
        width: "100%",
        height: "48px",
      }}
    >
      {/* Filled portion */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${fillPercent}%`,
          height: "100%",
          background: accentColor,
          transition: "width 0.2s linear",
        }}
      ></div>
    </div>
  );
}
