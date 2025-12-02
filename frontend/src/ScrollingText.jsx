import { useRef, useEffect, useState } from "react";

// Generate unique ID for each instance
let scrollingTextId = 0;

function ScrollingText({ children, style, gap = 50, speed = 50 }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [animationId] = useState(() => `scrollText-${scrollingTextId++}`);

  useEffect(() => {
    const measureScroll = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const textWidth = textRef.current?.scrollWidth || 0;
      const needsScroll = textWidth > containerWidth;
      setShouldScroll(needsScroll);
      if (needsScroll) {
        setScrollDistance(textWidth + gap);
      }
    };

    measureScroll();
    // Remeasure on window resize
    window.addEventListener('resize', measureScroll);
    return () => window.removeEventListener('resize', measureScroll);
  }, [children, gap]);

  // Dynamic duration based on text width (px per second)
  const duration = scrollDistance / speed || 10;

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        position: "relative",
        ...style,
      }}
    >
      {shouldScroll ? (
        <>
          <div
            style={{
              display: "inline-flex",
              gap: `${gap}px`,
              animation: `${animationId} ${duration}s linear infinite`,
            }}
          >
            <span ref={textRef}>{children}</span>
            <span>{children}</span>
          </div>
          <style>{`
            @keyframes ${animationId} {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-${scrollDistance}px);
              }
            }
          `}</style>
        </>
      ) : (
        <div ref={textRef}>{children}</div>
      )}
    </div>
  );
}

export default ScrollingText;
