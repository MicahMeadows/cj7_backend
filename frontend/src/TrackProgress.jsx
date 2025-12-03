import React, { useEffect, useState, useRef } from "react";

function formatTime(ms) {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackProgress({ playerState, bgColor, accentColor}) {
  const [currentPos, setCurrentPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastPlayerStateRef = useRef(null);

  // Reset if new song data comes in
  useEffect(() => {
    if (playerState && playerState !== lastPlayerStateRef.current) {
      setCurrentPos(playerState.playbackPosition || 0);
      setDuration(playerState.track?.duration || 0);
      lastPlayerStateRef.current = playerState;
    }
  }, [playerState]);

  // Update position every second
  useEffect(() => {
    if (!duration) return; // nothing to track
    const interval = setInterval(() => {
      setCurrentPos((prev) => (prev < duration ? prev + 50 : prev));
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const progressPercent = duration ? (currentPos / duration) * 100 : 0;
  
  return (
    <div style={{
    }}>
      <div
        style={{
          position: "relative",
          height: "40px",
          border: `3px solid ${accentColor}`,
          background: bgColor,
          overflow: "hidden",
        }}
      >
        {/* Fill bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${progressPercent}%`,
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
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 12px",
            color: accentColor,
            fontSize: "2rem",
            fontWeight: "500",
          }}
        >
          <span>{formatTime(currentPos)}</span>
          <span>{formatTime(duration)}</span>
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
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 12px",
            color: bgColor,
            fontSize: "2rem",
            fontWeight: "500",
            clipPath: `inset(0 ${100 - progressPercent}% 0 0)`,
          }}
        >
          <span>{formatTime(currentPos)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
