import { useEffect, useRef, useState } from "react";

export default function GoogleMap({ center, zoom, width, height }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load script once
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    let existing = document.querySelector("#google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
      });
    } else {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [scriptLoaded, center.lat, center.lng, zoom]);

  return <div ref={mapRef} style={{ width, height }} />;
}
