import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './App.css'
import MapUtils from './coordinate_helpers'
import MapCanvas from './MapCanvas'
import Constants from './const'

// Connect to your Socket.IO server
// Replace with your server URL if it's not the same origin
const socket = io('http://127.0.0.1:8089')

function App() {
  const [message, setMessage] = useState('Test World')
  const [imageData, setImageData] = useState(null)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const tileMap = useRef(new Map());
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);
  const [dragCenterLatLong, setDragCenterLatLong] = useState(null);

  // useEffect(() => {
  //   if (dragCenterLatLong === null) return;
  
  //   const threshold = 200; // world pixel distance allowed
  //   const [centerLat, centerLng] = dragCenterLatLong;
  
  //   // Convert drag center → world pixel
  //   const dragCenterPx = MapUtils.fromLatLngToPoint(centerLat, centerLng, Constants.ZOOM);
  
  //   // Compute tile of the drag center
  //   const centerTile = MapUtils.fromLatLngToTileCoord(centerLat, centerLng, Constants.ZOOM);
  
  //   const offsets = [
  //     [0, 0],   // center
  //     [-1, 0],  // left
  //     [1, 0],   // right
  //     [0, -1],  // up
  //     [0, 1],   // down
  //     [-1, -1], // up-left
  //     [1, -1],  // up-right
  //     [-1, 1],  // down-left
  //     [1, 1],   // down-right
  //   ];
  
  //   offsets.forEach(([dx, dy]) => {
  //     const tileX = centerTile.x + dx;
  //     const tileY = centerTile.y + dy;
  
  //     // Get the center of the tile in world pixel space
  //     const tileCenterLatLng = MapUtils.fromTileCoordToLatLng(tileX + 0.5, tileY + 0.5, Constants.ZOOM);
  //     const tileCenterPx = MapUtils.fromLatLngToPoint(tileCenterLatLng.lat, tileCenterLatLng.lng, Constants.ZOOM);
  
  //     // Compute distance
  //     const dist = Math.hypot(
  //       tileCenterPx.x - dragCenterPx.x,
  //       tileCenterPx.y - dragCenterPx.y
  //     );
  
  //     if (dist > threshold) return; // skip tile
  
  //     const key = `${tileX}_${tileY}_${Constants.ZOOM}`;
  //     if (!tileMap.current.has(key)) {
  //       console.log("Tile missing, requesting:", { x: tileX, y: tileY, z: Constants.ZOOM });
  //       socket.emit("request_tile", { x: tileX, y: tileY, zoom: Constants.ZOOM });
  //     }
  //   });
  
  // }, [dragCenterLatLong]);

  useEffect(() => {
    if (dragCenterLatLong === null) return;
  
    const centerTile = MapUtils.fromLatLngToTileCoord(
      dragCenterLatLong[0],
      dragCenterLatLong[1],
      Constants. ZOOM
    );
  
    const offsets = [
      [0, 0],   // center
      // [-1, 0],  // left
      // [1, 0],   // right
      // [0, -1],  // top
      // [0, 1],   // bottom
      // [-1, -1], // top-left
      // [1, -1],  // top-right
      // [-1, 1],  // bottom-left
      // [1, 1],   // bottom-right
    ];
  
    offsets.forEach(([dx, dy]) => {
      const tileX = centerTile.x + dx;
      const tileY = centerTile.y + dy;
  
      const key = `${tileX}_${tileY}_${Constants.ZOOM}`;
  
      if (!tileMap.current.has(key)) {
        console.log('Tile missing, requesting:', { x: tileX, y: tileY, z: Constants.ZOOM });
        socket.emit('request_tile', { x: tileX, y: tileY, zoom: Constants.ZOOM });
      }
    });
  
  }, [dragCenterLatLong]);


  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
      // socket.emit('request_tiles', {})
      console.log(`requesting tiles...`)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })  

    socket.on('update_text', (data) => {
      setMessage(data['data']) // Update state with new text
    })

    socket.on('web_map_tile', (data) => {
      const key = `${data.x}_${data.y}_${data.zoom}`;
    
      console.log(`Received tile: ${key}, size: ${data.image.length} bytes`);
      tileMap.current.set(key, data);
    });

    // When location updates
    socket.on('web_location_update', (data) => {
      const lat = data.lat;
      const lon = data.long;
    
      setLatLong([lat, lon]);
      if (dragCenterLatLong === null) {
        setDragCenterLatLong([lat, lon]);
      }

      // updateTilesMap();
    });


    socket.on('album_image_bitmap', (data) => {
      console.log('Received album image data of length:', data.length)
      setImageData(data)
      // Here you can handle the image data (e.g., convert to Blob and display)
    })

    // Cleanup on unmount
    return () => {
      socket.off('update-text')
    }
  }, [])

  return (
    <div className="App">
      <div onClick={() => {
        console.log('skip')
        socket.emit('skip_song')
      }}>
        <MapCanvas 
          focusLat={curLatLong[0]} 
          focusLong={curLatLong[1]} 
          zoom={Constants.ZOOM}   
          tileList={Array.from(tileMap.current.values())} 
          onCenterChange={(latLng) => {
            setDragCenterLatLong([latLng[0], latLng[1]])
            // updateTilesMap()
          }} 
        />

        { isConnected && 
        <h3> SocketIO Connected </h3>}
        { !isConnected && 
        <h3> SocketIO Disconnected </h3>}
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
  )
}

export default App
