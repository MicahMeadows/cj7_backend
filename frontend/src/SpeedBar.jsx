import React from "react";

const SpeedBar = ({ value, width = "100%", height = "100%", color = "white" }) => {
  const clampedValue = Math.max(0, Math.min(60, value));
  const totalRects = 12; // 60 / 5
  const rectHeight = parseFloat(height) / totalRects; // height per rectangle

  // How many rectangles should be filled
  const filledRects = Math.floor(clampedValue / 5);

  const rects = Array.from({ length: totalRects }, (_, i) => {
    const isFilled = i < filledRects;
    return (
        <div
            key={i}
            style={{
                padding: "2px 10px",
                width: "100%",
                height: `${100 / totalRects}%`, // each rectangle takes equal fraction
            }}
        >
            <div style={{
                backgroundColor: isFilled ? color : "transparent",
                height: "100%",
                width: "100%",
            }}>

            </div>

        </div>
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse", // fill bottom to top
        width,
        height: "100%", // take full container height
      }}
    >
      {rects}
    </div>
  );
};

export default SpeedBar;
