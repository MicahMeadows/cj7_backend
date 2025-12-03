import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

const Constants = {
  MAP_ID: "YOUR_MAP_ID",
  mapStyles: []
};

const GoogleMap = forwardRef(({ center, zoom, segments, bearing, style }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const polylinesRef = useRef([]);
  
  // Animation state
  const animationRef = useRef(null);
  const currentPositionRef = useRef(null);
  const targetPositionRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());

  // Smooth position animation
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.userMarker) return;
    
    const newTarget = { lat: center.lat, lng: center.lng };
    
    // Initialize current position on first update
    if (!currentPositionRef.current) {
      currentPositionRef.current = newTarget;
      targetPositionRef.current = newTarget;
      mapInstance.current.userMarker.setPosition(newTarget);
      if (!isUserDragging) {
        mapInstance.current.setCenter(newTarget);
      }
      return;
    }
    
    // Update target position
    targetPositionRef.current = newTarget;
    lastUpdateTimeRef.current = Date.now();
    
    // Cancel existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start animation loop
    const animate = () => {
      if (!currentPositionRef.current || !targetPositionRef.current) return;
      
      const current = currentPositionRef.current;
      const target = targetPositionRef.current;
      
      // Calculate distance
      const latDiff = target.lat - current.lat;
      const lngDiff = target.lng - current.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      // If we're close enough, snap to target
      if (distance < 0.0000001) {
        currentPositionRef.current = target;
        mapInstance.current.userMarker.setPosition(target);
        if (!isUserDragging) {
          mapInstance.current.setCenter(target);
        }
        return;
      }
      
      // Adaptive speed based on distance
      // Larger jumps = faster animation to catch up
      const timeSinceUpdate = Date.now() - lastUpdateTimeRef.current;
      const baseSpeed = 0.003; // Base interpolation speed
      const urgencyMultiplier = Math.min(timeSinceUpdate / 1000, 2); // Speed up if falling behind
      const distanceMultiplier = Math.min(distance * 10000, 50); // Speed up for large jumps
      const speed = Math.min(baseSpeed * (1 + urgencyMultiplier + distanceMultiplier), 0.95);
      
      // Interpolate position
      const newLat = current.lat + latDiff * speed;
      const newLng = current.lng + lngDiff * speed;
      const newPosition = { lat: newLat, lng: newLng };
      
      currentPositionRef.current = newPosition;
      mapInstance.current.userMarker.setPosition(newPosition);
      
      if (!isUserDragging) {
        mapInstance.current.setCenter(newPosition);
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [center.lat, center.lng, isUserDragging]);

  // Update zoom
  useEffect(() => {
    if (!mapInstance.current || isUserDragging) return;
    mapInstance.current.setZoom(zoom);
  }, [zoom, isUserDragging]);

  // Draw route segments
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Rotate map
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
      
      // Track dragging state
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
    }
  }, [scriptLoaded]);

  // Expose recenter
  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (mapInstance.current && targetPositionRef.current) {
        mapInstance.current.setCenter(targetPositionRef.current);
        currentPositionRef.current = targetPositionRef.current;
        setIsUserDragging(false);
      }
    }
  }));

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
});

export default GoogleMap;