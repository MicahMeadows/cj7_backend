import { useState } from "react";

export default function GreenMonochromeFilter({
  children,
  initialInvert = null,
  initialGrayscale = null,
  initialBrightness = null,
  initialSepia = null,
  initialHue = null,
  initialSaturate = null,
  initialContrast = null,
}) {
  // If the initial value is null, show sliders and allow state changes
  const [invert, setInvert] = useState(initialInvert ?? 0);
  const [grayscale, setGrayscale] = useState(initialGrayscale ?? 1);
  const [brightness, setBrightness] = useState(initialBrightness ?? 0.5);
  const [sepia, setSepia] = useState(initialSepia ?? 1);
  const [hue, setHue] = useState(initialHue ?? 90);
  const [saturate, setSaturate] = useState(initialSaturate ?? 10);
  const [contrast, setContrast] = useState(initialContrast ?? 1);

  const filterStyle = {
    filter: `invert(${invert}) grayscale(${grayscale}) brightness(${brightness}) sepia(${sepia}) hue-rotate(${hue}deg) saturate(${saturate}) contrast(${contrast})`
  };

  return (
    <div>
      {(initialInvert === null ||
        initialGrayscale === null ||
        initialBrightness === null ||
        initialSepia === null ||
        initialHue === null ||
        initialSaturate === null ||
        initialContrast === null) && (
        <div style={{ marginBottom: 20 }}>
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
              Brightness: {brightness}
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

      <div style={filterStyle}>
        {children}
      </div>
    </div>
  );
}
