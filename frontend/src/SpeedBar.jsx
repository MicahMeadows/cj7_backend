import React from "react";

const SpeedBar = ({ value, width = "100%", height = "100%", color = "white" }) => {
  const clampedValue = Math.max(0, Math.min(60, value));
  const totalRects = 12; // 60 / 5
  const minHeight = 4;  // smallest rectangle (%)
  const maxHeight = 16; // largest rectangle (%), increased for bigger steps

  const filledRects = Math.floor(clampedValue / 5);

  const rects = Array.from({ length: totalRects }, (_, i) => {
    const isFilled = i < filledRects;

    // exponential step for bigger height difference
    const rectFraction = (i + 1) / totalRects;
    const rectHeight = minHeight + Math.pow(rectFraction, 2) * (maxHeight - minHeight);

    return (
      <div
        key={i}
        style={{
          padding: "2px 0",
          width: "100%",
          height: `${rectHeight}%`,
        }}
      >
        <div
          style={{
            backgroundColor: isFilled ? color : "transparent",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        width,
        height: "100%",
      }}
    >
      {rects}
    </div>
  );
};

export default SpeedBar;
