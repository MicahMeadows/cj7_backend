import React, { useRef, useEffect, useState } from 'react';
import MapUtils from './coordinate_helpers';

const TILE_SIZE = 256;

const MapCanvas = ({ focusLat, focusLong, zoom, tileList }) => {
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // drag offset
  const [dragStart, setDragStart] = useState(null);
  const tileCache = useRef(new Map());

  const canvasSize = 600;
  const canvasCenter = canvasSize / 2;

  // Load tiles into cache
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

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  
    // Focus point in world pixels
    const centerPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
  
    // Draw all tiles
    tileCache.current.forEach((img, key) => {
      const [tileX, tileY] = key.split('_').map(Number);
  
      // Tile index → top-left lat/lng
      const { lat, lng } = MapUtils.fromTileCoordToLatLng(tileX, tileY, zoom);
  
      // Tile lat/lng → world pixels
      const tilePixel = MapUtils.fromLatLngToPoint(lat, lng, zoom);
  
      // Tile canvas coordinates relative to center + drag offset
      const dx = canvasCenter + (tilePixel.x - centerPixel.x) + offset.x;
      const dy = canvasCenter + (tilePixel.y - centerPixel.y) + offset.y;
  
      // Draw only if visible
      if (dx + TILE_SIZE > 0 && dx < canvasSize && dy + TILE_SIZE > 0 && dy < canvasSize) {
        ctx.drawImage(img, dx, dy, TILE_SIZE, TILE_SIZE);
      }
    });
  
    // --- Draw red dot at its map location, not fixed center ---
    // Convert focusLat/focusLong to world pixels
    const dotPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
    // Translate to canvas coordinates relative to center + offset
    const dotCanvasX = canvasCenter + (dotPixel.x - centerPixel.x) + offset.x;
    const dotCanvasY = canvasCenter + (dotPixel.y - centerPixel.y) + offset.y;
  
    ctx.fillStyle = 'black';       // fill color
    ctx.strokeStyle = '#41ff00';   // outline color
    ctx.lineWidth = 3;             // outline thickness
    ctx.beginPath();
    ctx.arc(dotCanvasX, dotCanvasY, 15, 0, 2 * Math.PI);
    ctx.fill();    // fill first
    ctx.stroke();  // then outline
    
  };
  
  

  // Drag handlers
  const handleMouseDown = (e) =>
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  const handleMouseMove = (e) => {
    if (!dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragStart(null);

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
