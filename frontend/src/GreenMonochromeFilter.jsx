import { useState } from "react";

export default function GreenMonochromeFilter({
  children,
  initialInvert = null,
  initialGrayscale = null,
  initialBrightness = null,
  maxBrightness = null,
  initialSepia = null,
  initialHue = null,
  initialSaturate = null,
  initialContrast = null,
}) {
  const [invert, setInvert] = useState(initialInvert ?? 0);
  const [grayscale, setGrayscale] = useState(initialGrayscale ?? 1);
  const [brightness, setBrightness] = useState(initialBrightness ?? 0.5);
  const [sepia, setSepia] = useState(initialSepia ?? 1);
  const [hue, setHue] = useState(initialHue ?? 90);
  const [saturate, setSaturate] = useState(initialSaturate ?? 10);
  const [contrast, setContrast] = useState(initialContrast ?? 1);
  const [autoBrightness, setAutoBrightness] = useState(null);

  const analyzeImageBrightness = (imgElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(imgElement, 0, 0, 32, 32);
    const imageData = ctx.getImageData(0, 0, 32, 32);
    const data = imageData.data;
    
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += gray;
    }
    
    const avgBrightness = sum / (32 * 32);
    const normalizedBrightness = avgBrightness / 255;
    
    const minBright = initialBrightness ?? 0.5;
    const maxBright = maxBrightness ?? minBright;
    // Invert: dark images (0) get max brightness, bright images (255) get min brightness
    const calculatedBrightness = maxBright - (normalizedBrightness * (maxBright - minBright));
    
    setAutoBrightness(calculatedBrightness);
  };

  const effectiveBrightness = autoBrightness !== null ? autoBrightness : brightness;

  const filterStyle = {
    filter: `invert(${invert}) grayscale(${grayscale}) brightness(${effectiveBrightness}) sepia(${sepia}) hue-rotate(${hue}deg) saturate(${saturate}) contrast(${contrast})`
  };

  return (
    <div style={{ height: "100%" }}>
      {(initialInvert === null ||
        initialGrayscale === null ||
        initialBrightness === null ||
        initialSepia === null ||
        initialHue === null ||
        initialSaturate === null ||
        initialContrast === null) && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "10px",
            borderRadius: "8px",
            color: "#0f0",
            zIndex: 9999,
            maxWidth: "250px",
          }}
        >
          {initialInvert === null && (
            <label>
              Invert: {invert}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={invert}
                onChange={e => setInvert(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialGrayscale === null && (
            <label>
              Grayscale: {grayscale}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={grayscale}
                onChange={e => setGrayscale(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialBrightness === null && (
            <label>
              Brightness: {effectiveBrightness.toFixed(2)}
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={brightness}
                onChange={e => setBrightness(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialSepia === null && (
            <label>
              Sepia: {sepia}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sepia}
                onChange={e => setSepia(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialHue === null && (
            <label>
              Hue: {hue}°
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={hue}
                onChange={e => setHue(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialSaturate === null && (
            <label>
              Saturate: {saturate}
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={saturate}
                onChange={e => setSaturate(e.target.value)}
              />
            </label>
          )}
          <br />
          {initialContrast === null && (
            <label>
              Contrast: {contrast}
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={contrast}
                onChange={e => setContrast(e.target.value)}
              />
            </label>
          )}
        </div>
      )}

      <div 
        style={{ ...filterStyle, height: "100%" }}
        ref={(node) => {
          if (node && maxBrightness !== null) {
            const img = node.querySelector('img');
            if (img && img.complete) {
              analyzeImageBrightness(img);
            } else if (img) {
              img.onload = () => analyzeImageBrightness(img);
            }
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}