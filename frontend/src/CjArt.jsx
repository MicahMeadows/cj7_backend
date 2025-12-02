import React from "react";
import Constants from "./const";

const ascii = `  ________        ___    _______  
 |\\   ____\\      |\\  \\  |\\____  \\
 \\ \\  \\___|      \\ \\  \\ \\|___/  /|
  \\ \\  \\       __ \\ \\  \\    /  / /
   \\ \\  \\____ |\\  \\\\_\\  \\  /  / / 
    \\ \\_______\\ \\________\\/__/ /  
     \\|_______|\\|________||__|/ `;

const CjArt = () => {
  const lines = ascii.split("\n");

  return (
    <div
      style={{
        whiteSpace: "pre",
        fontFamily: "'Anonymous Pro', monospace",
        textAlign: "left",
        lineHeight: "1.1",
        margin: 0,
        padding: 0,
        marginTop: "-15px",
        color: Constants.RETRO_GREEN,
        fontSize: "1.2rem",
        fontWeight: "bold",
      }}
    >
      {lines.map((line, rowIndex) => (
        <div key={rowIndex}>
          {line.split("").map((char, colIndex) => (
            <span
              key={colIndex}
              className="wave-char"
              style={{
                animationDelay: `${colIndex * 50}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CjArt;
