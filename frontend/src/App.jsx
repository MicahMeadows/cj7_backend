import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './App.css'
import MapUtils from './coordinate_helpers'
import MapCanvas from './MapCanvas'

// Connect to your Socket.IO server
// Replace with your server URL if it's not the same origin
const socket = io('http://127.0.0.1:8089')

function App() {
  const [message, setMessage] = useState('Test World')
  const [imageData, setImageData] = useState(null)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const tileMap = useRef(new Map());
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);

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
      console.log('Received map tile:', data.x, data.y);
    
      const key = `${data.x}_${data.y}_${data.zoom}`;
    
      tileMap.current.set(key, data);
    
      console.log('Current tile map size:', tileMap.current.size);
    });

    // When location updates
    socket.on('web_location_update', (data) => {
      const lat = data.lat;
      const lon = data.long;
      const zoom = 17;
    
      const centerTile = MapUtils.fromLatLngToTileCoord(lat, lon, zoom);
    
      // Offsets to get center + top/bottom/left/right
      const offsets = [
        [0, 0],    // center
        [-1, 0],   // left
        [1, 0],    // right
        [0, -1],   // top
        [0, 1],    // bottom
      ];
    
      offsets.forEach(([dx, dy]) => {
        const tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
        const key = `${tileX}_${tileY}_${zoom}`;
    
        // Only request tile if not already in cache
        if (!tileMap.current.has(key)) {
          console.log('Tile missing, requesting:', { x: tileX, y: tileY, z: zoom });
          socket.emit('request_tile', { x: tileX, y: tileY, zoom });
        }
      });
    
      setLatLong([lat, lon]);
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
        <MapCanvas focusLat={curLatLong[0]} focusLong={curLatLong[1]} zoom={17}   tileList={Array.from(tileMap.current.values())} />

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
