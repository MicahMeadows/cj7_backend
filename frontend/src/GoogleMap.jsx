import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import Constants from "./const";

const GoogleMap = forwardRef(({ center, zoom, width, height, segments, bearing }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const polylinesRef = useRef([]);
  const markerPositionRef = useRef(center);

  // Update marker and map center immediately when center changes
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.userMarker) return;

    const marker = mapInstance.current.userMarker;

    // Update marker
    markerPositionRef.current = center;
    marker.setPosition(center);

    // Update map center only if user isn't dragging
    if (!isUserDragging) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom, isUserDragging]);

  // Handle route segments
  useEffect(() => {
    if (!mapInstance.current || !segments) return;

    segments.forEach((seg, i) => {
      if (!seg) return;

      const path = seg.map(p => ({ lat: p.latitude, lng: p.longitude }));

      if (polylinesRef.current[i]) {
        polylinesRef.current[i].setPath(path);
      } else {
        const polyline = new google.maps.Polyline({
          path,
          map: mapInstance.current,
          strokeColor: "#000000",
          strokeOpacity: 1.0,
          strokeWeight: 15
        });
        polylinesRef.current[i] = polyline;
      }
    });

    if (polylinesRef.current.length > segments.length) {
      polylinesRef.current.slice(segments.length).forEach(p => p.setMap(null));
      polylinesRef.current.length = segments.length;
    }
  }, [segments, scriptLoaded]);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Rotate map to match bearing
  useEffect(() => {
    if (!mapInstance.current) return;
    if (bearing != null) {
      mapInstance.current.setHeading(bearing);
    }
  }, [bearing]);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: "roadmap",
        mapId: Constants.MAP_ID,
        styles: Constants.mapStyles,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        scaleControl: false,
        rotateControl: false,
        clickableIcons: false,
        draggable: true,
        gestureHandling: "greedy",
      });

      mapInstance.current.setTilt(35);

      // Track dragging
      mapInstance.current.addListener("dragstart", () => setIsUserDragging(true));
      mapInstance.current.addListener("dragend", () => setIsUserDragging(false));

      // Add marker
      mapInstance.current.userMarker = new google.maps.Marker({
        position: center,
        map: mapInstance.current,
        title: "My Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#00ff00",
          strokeWeight: 3,
          scale: 15
        }
      });

      markerPositionRef.current = center;
    }
  }, [scriptLoaded]);

  // Expose recenter method
  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (mapInstance.current) {
        mapInstance.current.setCenter(center);
        setIsUserDragging(false);
      }
    }
  }));

  return <div ref={mapRef} style={{ width, height }} />;
});

export default GoogleMap;
