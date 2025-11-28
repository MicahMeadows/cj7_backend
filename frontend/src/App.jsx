import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import GoogleMap from './GoogleMap';


const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// Connect to your Socket.IO server
const socket = io('http://127.0.0.1:8089');

function formatTimeLeft(seconds) {
  if (!seconds || seconds < 0) return "0 min";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} min`;
  }

  return `${minutes} min`;
}

function formatDistanceLeft(meters) {
  if (!meters || meters < 0) return "0 miles";

  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} miles`;
}

function App() {
  const [message, setMessage] = useState('Test World');
  const [imageData, setImageData] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);
  const [dragCenterLatLong, setDragCenterLatLong] = useState(null);
  const mapRef = useRef(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [distanceLeft, setDistanceLeft] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`requesting tiles...`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('web_time_and_distance', (data) => {
      setTimeLeft(data.seconds);
      setDistanceLeft(data.meters);
      console.log(`Time left: ${data.seconds} seconds, Distance left: ${data.meters} meters`);
    });

    socket.on('web_map_tile', (data) => {
      const key = `${data.x}_${data.y}_${data.zoom}`;
      console.log(`Received tile: ${key}, size: ${data.image.length} bytes`);
      tileMap.current.set(key, data);
    });

    socket.on('web_route_segments', (data) => {
      setRouteSegments(JSON.parse(data));
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
        <h2>Time Left: { formatTimeLeft(timeLeft) }s</h2>
        <h2>Distance Left: { formatDistanceLeft(distanceLeft) }m</h2>
        <GoogleMap
          ref={mapRef}
          center={{
            lat: curLatLong[0],
            lng: curLatLong[1],
          }}
          zoom={18}
          width={600}
          height={600}
          segments={routeSegments}   // <-----
        />
        <button onClick={() => mapRef.current.recenter()}>
          Recenter Map
        </button>

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
