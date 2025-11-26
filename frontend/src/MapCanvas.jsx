import React, { useRef, useEffect, useState } from 'react';
import MapUtils from './coordinate_helpers';
import Constants from './const';

const MapCanvas = ({ focusLat, focusLong, zoom, tileList, onCenterChange }) => {
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // drag offset
  const [dragStart, setDragStart] = useState(null);
  const tileCache = useRef(new Map());
  const debounceRef = useRef(null);

  const canvasSize = 600;
  const canvasCenter = canvasSize / 2;

  useEffect(() => {
    if (onCenterChange) {
      // fire immediately with default center
      onCenterChange([focusLat, focusLong]);
    }
  }, []); // empty deps → runs once on mount


  // Draw function
  const TILE_ZOOM = 1;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const centerPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);

    tileCache.current.forEach((img, key) => {
      const [tileX, tileY] = key.split('_').map(Number);
      const { lat, lng } = MapUtils.fromTileCoordToLatLng(tileX, tileY, zoom);
      const tilePixel = MapUtils.fromLatLngToPoint(lat, lng, zoom);

      const dx = canvasCenter + (tilePixel.x - centerPixel.x) * TILE_ZOOM + offset.x;
      const dy = canvasCenter + (tilePixel.y - centerPixel.y) * TILE_ZOOM + offset.y;

      if (dx + Constants.TILE_SIZE * TILE_ZOOM > 0 && dx < canvasSize && dy + Constants.TILE_SIZE * TILE_ZOOM > 0 && dy < canvasSize) {
        ctx.drawImage(img, dx, dy, Constants.TILE_SIZE * TILE_ZOOM, Constants.TILE_SIZE * TILE_ZOOM);
      }
    });

    // Red dot
    const dotPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
    const dotCanvasX = canvasCenter + (dotPixel.x - centerPixel.x) * TILE_ZOOM + offset.x;
    const dotCanvasY = canvasCenter + (dotPixel.y - centerPixel.y) * TILE_ZOOM + offset.y;

    ctx.fillStyle = 'black';
    ctx.strokeStyle = '#41ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(dotCanvasX, dotCanvasY, 9 * TILE_ZOOM, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };


  // --- Convert current offset to center lat/lng ---
  const updateCenter = (newOffset) => {
    const centerPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
  
    // Scale offset by TILE_ZOOM so center aligns with visual
    const newCenterPixel = {
      x: centerPixel.x - newOffset.x / TILE_ZOOM,
      y: centerPixel.y - newOffset.y / TILE_ZOOM,
    };
  
    const { lat, lng } = MapUtils.fromPointToLatLng(newCenterPixel.x, newCenterPixel.y, zoom);
  
    if (onCenterChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
  
      debounceRef.current = setTimeout(() => {
        onCenterChange([lat, lng]);
      }, 300);
    }
  };
  

  // Drag handlers
  const handleMouseDown = (e) =>
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const newOffset = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setOffset(newOffset);
    updateCenter(newOffset); // fire callback
  };

  const handleMouseUp = () => setDragStart(null);

  // Cache tiles
  useEffect(() => {
    tileList.forEach((tile) => {
      const key = `${tile.x}_${tile.y}`;
      if (!tileCache.current.has(key)) {
        const img = new Image();
        img.src = `data:image/png;base64,${tile.image}`;
        img.onload = draw;
        tileCache.current.set(key, img);
      }
    });
    draw();
  }, [tileList, offset]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{ border: '1px solid black', cursor: dragStart ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};


export default MapCanvas;
