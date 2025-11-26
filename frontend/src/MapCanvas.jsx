import React, { useRef, useEffect, useState } from 'react';
import MapUtils from './coordinate_helpers';
import Constants from './const';

const MapCanvas = ({ focusLat, focusLong, zoom, tileList, angle = 0, onCenterChange }) => {
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


  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  
    // Translate to canvas center
    ctx.save(); // save state
    ctx.translate(canvasCenter, canvasCenter);
    ctx.rotate((angle * Math.PI) / 180); // rotate around center
  
    const centerPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
  
    // Draw tiles
    tileCache.current.forEach((img, key) => {
      const [tileX, tileY] = key.split('_').map(Number);
      const { lat, lng } = MapUtils.fromTileCoordToLatLng(tileX, tileY, zoom);
      const tilePixel = MapUtils.fromLatLngToPoint(lat, lng, zoom);

      const dx = (tilePixel.x - centerPixel.x) * Constants.TILE_ZOOM + offset.x;
      const dy = (tilePixel.y - centerPixel.y) * Constants.TILE_ZOOM + offset.y;

      // Remove half-tile subtraction
      ctx.drawImage(img, dx, dy, Constants.TILE_SIZE*Constants.TILE_ZOOM, Constants.TILE_SIZE*Constants.TILE_ZOOM);

      // const dx = (tilePixel.x - centerPixel.x) * Constants.TILE_ZOOM + offset.x;
      // const dy = (tilePixel.y - centerPixel.y) * Constants.TILE_ZOOM + offset.y;
    
      // // Draw all tiles in a loose area around center (instead of strict axis-aligned check)
      // if (
      //   Math.abs(dx) < canvasSize / 2 + Constants.TILE_SIZE * Constants.TILE_ZOOM &&
      //   Math.abs(dy) < canvasSize / 2 + Constants.TILE_SIZE * Constants.TILE_ZOOM
      // ) {
      //   ctx.drawImage(
      //     img,
      //     dx - Constants.TILE_SIZE * Constants.TILE_ZOOM / 2,
      //     dy - Constants.TILE_SIZE * Constants.TILE_ZOOM / 2,
      //     Constants.TILE_SIZE * Constants.TILE_ZOOM,
      //     Constants.TILE_SIZE * Constants.TILE_ZOOM
      //   );
      // }
    });
    
  
    // Draw red dot at center (player location)
    ctx.save();

    // Compute rotated offset for drawing the player dot
    const rad = (angle * Math.PI) / 180;
    const rotatedOffsetX = offset.x * Math.cos(rad) + offset.y * Math.sin(rad);
    const rotatedOffsetY = -offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

    ctx.fillStyle = 'black';
    ctx.strokeStyle = '#41ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(offset.x, offset.y, 9 * Constants.TILE_ZOOM, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    

    ctx.restore();

    if (Constants.RENDER_DEBUG_CANVAS) {
      const thresholdPx = Constants.TILE_QUERY_THRESHOLD;
      const radius = thresholdPx * Constants.TILE_ZOOM;
    
      // Save state in case the canvas is rotated
      ctx.save();
    
      // Draw threshold circle at canvas center (0,0 after translate)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 150, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.arc(0, 0, radius, 0, 2 * Math.PI); // full circle
      ctx.stroke();
    
      ctx.restore();
    }

  
    // if (Constants.RENDER_DEBUG_CANVAS) {
    //   const thresholdPx = Constants.TILE_QUERY_THRESHOLD;
    //   const halfSide = thresholdPx * Constants.TILE_ZOOM;
    
    //   // Save current rotated state
    //   ctx.save();
    
    //   // Counter-rotate so box is axis-aligned
    //   ctx.rotate((-angle * Math.PI) / 180);
    
    //   // Draw threshold box at canvas center (0,0 after translate)
    //   ctx.beginPath();
    //   ctx.strokeStyle = "rgba(0, 150, 255, 0.6)";
    //   ctx.lineWidth = 2;
    //   ctx.rect(-halfSide, -halfSide, halfSide * 2, halfSide * 2);
    //   ctx.stroke();
    
    //   ctx.restore(); // go back to rotated state for other drawings
    // }
    
  
    ctx.restore(); // restore original canvas state
  };
  


  // --- Convert current offset to center lat/lng ---
  const updateCenter = (newOffset) => {
    const centerPixel = MapUtils.fromLatLngToPoint(focusLat, focusLong, zoom);
  
    // Scale offset by TILE_ZOOM so center aligns with visual
    const newCenterPixel = {
      x: centerPixel.x - newOffset.x / Constants.TILE_ZOOM,
      y: centerPixel.y - newOffset.y / Constants.TILE_ZOOM,
    };
  
    const { lat, lng } = MapUtils.fromPointToLatLng(newCenterPixel.x, newCenterPixel.y, zoom);

    if (onCenterChange) {
      onCenterChange([lat, lng]);
    }
  };
  

  // Drag handlers
  // const handleMouseDown = (e) => setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  const handleMouseDown = (e) => setDragStart({ x: e.clientX, y: e.clientY });

  const handleMouseMove = (e) => {
    if (!dragStart) return;
  
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
  
    const rad = (angle * Math.PI) / 180;
  
    // Rotate delta relative to map rotation
    const rotatedDx = dx * Math.cos(rad) + dy * Math.sin(rad);
    const rotatedDy = -dx * Math.sin(rad) + dy * Math.cos(rad);
  
    const newOffset = {
      x: offset.x + rotatedDx,
      y: offset.y + rotatedDy,
    };
  
    setOffset(newOffset);
    updateCenter(newOffset);
  
    setDragStart({ x: e.clientX, y: e.clientY }); // update drag start
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
