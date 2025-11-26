import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import MapUtils from './coordinate_helpers';
import MapCanvas from './MapCanvas';
import Constants from './const';

// Connect to your Socket.IO server
const socket = io('http://127.0.0.1:8089');

function App() {
  const [message, setMessage] = useState('Test World');
  const [imageData, setImageData] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const tileMap = useRef(new Map());
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);
  const [dragCenterLatLong, setDragCenterLatLong] = useState(null);
  const dragCenterLatLongRef = useRef(dragCenterLatLong);
  const [currentDirection, setCurrentDirection] = useState(45);

  // Keep the ref updated whenever dragCenterLatLong changes
  useEffect(() => {
    dragCenterLatLongRef.current = dragCenterLatLong;
  }, [dragCenterLatLong]);

  // Run tile query every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      const current = dragCenterLatLongRef.current;
      if (!current) return;

      const [centerLat, centerLng] = current;
      const dragCenterPx = MapUtils.fromLatLngToPoint(centerLat, centerLng, Constants.ZOOM);
      const centerTile = MapUtils.fromLatLngToTileCoord(centerLat, centerLng, Constants.ZOOM);

      const offsets = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
      ];

      // Convert currentDirection to radians for rotation

      const rad = (currentDirection * Math.PI) / 180; // map rotation in radians

      offsets.forEach(([dx, dy]) => {
        const tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
      
        // Convert the **top-left of the tile** to world pixels
        const tileTopLeftPx = MapUtils.fromTileCoordToLatLng(tileX, tileY, Constants.ZOOM);
        const tileTopLeftWorld = MapUtils.fromLatLngToPoint(tileTopLeftPx.lat, tileTopLeftPx.lng, Constants.ZOOM);
      
        // Tile center in pixels = top-left + half tile size in pixels
        const tileCenterPx = {
          x: tileTopLeftWorld.x + Constants.TILE_SIZE / 2,
          y: tileTopLeftWorld.y + Constants.TILE_SIZE / 2,
        };
      
        // Delta from drag center
        const deltaX = tileCenterPx.x - dragCenterPx.x;
        const deltaY = tileCenterPx.y - dragCenterPx.y;
      
        // Rotate delta to match canvas rotation
        const dxRot = deltaX * Math.cos(rad) + deltaY * Math.sin(rad);
        const dyRot = -deltaX * Math.sin(rad) + deltaY * Math.cos(rad);
      
        const distanceSquared = dxRot * dxRot + dyRot * dyRot;
        const radius = Constants.TILE_QUERY_THRESHOLD;
      
        // Request tile only if **center is inside the threshold circle**
        if (distanceSquared <= radius * radius) {
          const key = `${tileX}_${tileY}_${Constants.ZOOM}`;
          if (!tileMap.current.has(key)) {
            console.log("Tile missing, requesting:", { x: tileX, y: tileY, z: Constants.ZOOM });
            socket.emit("request_tile", { x: tileX, y: tileY, zoom: Constants.ZOOM });
          }
        }
      });
    }, 100); // every 100ms

    return () => clearInterval(interval); // cleanup on unmount
  }, [currentDirection]);

  // --- Socket events ---
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`requesting tiles...`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('update_text', (data) => {
      setMessage(data['data']);
    });

    socket.on('web_map_tile', (data) => {
      const key = `${data.x}_${data.y}_${data.zoom}`;
      console.log(`Received tile: ${key}, size: ${data.image.length} bytes`);
      tileMap.current.set(key, data);
    });

    socket.on('web_location_update', (data) => {
      const lat = data.lat;
      const lon = data.long;
      setLatLong([lat, lon]);
      if (dragCenterLatLong === null) {
        setDragCenterLatLong([lat, lon]);
      }
    });

    socket.on('album_image_bitmap', (data) => {
      console.log('Received album image data of length:', data.length);
      setImageData(data);
    });

    return () => {
      socket.off('update-text');
    };
  }, []);

  return (
    <div className="App">
      <div
        onClick={() => {
          console.log('skip');
          socket.emit('skip_song');
        }}
      >
        <MapCanvas
          angle={currentDirection}
          focusLat={curLatLong[0]}
          focusLong={curLatLong[1]}
          zoom={Constants.ZOOM}
          tileList={Array.from(tileMap.current.values())}
          onCenterChange={(latLng) => setDragCenterLatLong([latLng[0], latLng[1]])}
        />

        {isConnected && <h3> SocketIO Connected </h3>}
        {!isConnected && <h3> SocketIO Disconnected </h3>}
        <h3>NEXT</h3>
      </div>
      {imageData && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <img
            src={`data:image/jpeg;base64,${imageData}`}
            alt="Album Art"
            style={{ maxWidth: '300px', borderRadius: '10px' }}
          />
        </div>
      )}
      <h1 style={{ textAlign: 'center', marginTop: '50px' }}>{message}</h1>
    </div>
  );
}

export default App;
