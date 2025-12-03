import React from "react";

export default function VolumeBar({ value = 0, bgColor = "#333", accentColor = "#0f0" }) {
  // Clamp value between 0 and 15
  const clampedValue = Math.max(0, Math.min(15, value));
  const fillPercent = (clampedValue / 15) * 100;

  return (
    <div
      style={{
        position: "relative",
        height: "40px",
        border: `3px solid ${accentColor}`,
        background: bgColor,
        overflow: "hidden",
        width: "100%",
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

      {/* Text layer - unmasked (shows accent color on empty background) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          color: accentColor,
          fontSize: "2rem",
          fontWeight: "500",
          paddingLeft: "12px",
        }}
      >
        <span>VOLUME</span>
      </div>

      {/* Text layer - masked (shows bg color on filled area) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          color: bgColor,
          fontSize: "2rem",
          fontWeight: "500",
          clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
          paddingLeft: "12px",
        }}
      >
        <span>VOLUME</span>
      </div>
    </div>
  );
}