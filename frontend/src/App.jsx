import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import GoogleMap from './GoogleMap';
import GreenMonochromeFilter from './GreenMonochromeFilter';
import Constants from './const';
import SpeedBar from './SpeedBar.jsx';


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
  if (!meters || meters < 0) return "0 mi";

  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

function App() {
  const [message, setMessage] = useState('Test World');
  const [imageData, setImageData] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);
  const mapRef = useRef(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [distanceLeft, setDistanceLeft] = useState(null);
  const [currentBearing, setCurrentBearing] = useState(0);
  const [turnByTurn, setTurnByTurn] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`requsting page reload`);
      socket.emit('reload_page');
    });


    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('web_turn_by_turn', (data) => {
      // console.log('Turn-by-turn update:', data);
      setTurnByTurn(data)
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
      const bearing = data.bearing;
      const mph = Math.max(Math.round(data.speed), 0);
      setLatLong([lat, lon]);
        setCurrentBearing(bearing);
        setCurrentSpeed(mph)
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
    <div className="App" >
      <div
        style={{
          aspectRatio: "16 / 9",
          width: "100vw",
          backgroundColor: "black",
          overflow: "hidden",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: "100%",
          }}
          onClick={() => {
            console.log('skip');
            socket.emit('skip_song');
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: "5px 0",
            }}>
              <p>1985 Jeep CJ7</p>
              <p>09/21/2025 - 10:45PM</p>
          </div>
          <hr style={{ width: "100%", borderTop: "3px solid #ccc", padding: "5px" }} />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            // padding: "20px 0",           // optional if you want spacing inside
            flexGrow: 1,       // let it grow to remaining space
          }}>
            <div style={{
              width: "14%",
              border: "3px solid #fff",
              boxSizing: "border-box",
              margin: "0",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}>
                <div style={{
                  flexGrow: 1,
                  padding: "10px 0px",
                }}>
                  <SpeedBar value={60} color='white'></SpeedBar>
                </div>
                <hr style={{ width: "100%", borderTop: "3px solid #ccc", padding: "0"}} />
                <div>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    padding: "0px 15px",
                  }}>
                    {/* Left spacer */}
                    <div style={{ flex: 1 }}></div>

                    {/* Center number */}
                    <div>
                      <span style={{ fontSize: '5rem' }}>62</span>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    {/* Right MPH */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ display: 'inline-block', lineHeight: '0.9', fontSize: '1.4rem', paddingTop: '8px' }}>
                        <span>M</span><br />
                        <span>P</span><br />
                        <span>H</span>
                      </span>
                    </div>
                  </div>
                </div>
                

              </div>
            </div>

            <div style={{
              width: "54%",
              border: "3px solid #fff",
              boxSizing: "border-box",
              margin: "0",
            }}>
              Middle panel content
            </div>

            <div style={{
              width: "30%",
              border: "3px solid #fff",
              boxSizing: "border-box",
              margin: "0",
            }}>
              Right panel content
            </div>
          

          </div>
          {/* <h2>Speed: { currentSpeed }mph</h2>
          <h2>Tot Time Left: { formatTimeLeft(timeLeft) }</h2>
          <h2>Tot Distance Left: { formatDistanceLeft(distanceLeft) }</h2> */}
          {/* {
            turnByTurn && (
              <div>
                <h2>road: { turnByTurn.road }</h2>
                <h2>maneuver: { Constants.getManeuverName(turnByTurn.maneuver) }</h2>
                <h2>meters: { turnByTurn.meters } meters</h2>
                <h2>seconds: { turnByTurn.seconds } seconds</h2>
                <h2>side: { turnByTurn.side }</h2>
                <h2>step: { turnByTurn.step }</h2>
              </div>
            )
          } */}
          {/* <GreenMonochromeFilter
            initialBrightness={.9}
            initialContrast={1.1}
            initialGrayscale={1}
            initialHue={90}
            initialInvert={1}
            initialSaturate={20}
            initialSepia={1}
          >
            <GoogleMap
              ref={mapRef}
              center={{
                lat: curLatLong[0],
                lng: curLatLong[1],
              }}
              zoom={18}
              width={600}
              height={600}
              bearing={currentBearing}
              segments={routeSegments}   // <-----
            />
          </GreenMonochromeFilter> */}
          {/* <button onClick={() => mapRef.current.recenter()}>
            Recenter Map
          </button> */}

          {/* {isConnected && <h3> SocketIO Connected </h3>}
          {!isConnected && <h3> SocketIO Disconnected </h3>}
          <h3>NEXT</h3> */}
        </div>
        {/* {imageData && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <img
              src={`data:image/jpeg;base64,${imageData}`}
              alt="Album Art"
              style={{ maxWidth: '300px', borderRadius: '10px' }}
            />
          </div>
        )} */}
        {/* <h1 style={{ textAlign: 'center', marginTop: '50px' }}>{message}</h1> */}
      </div>
    </div>
  );
}

export default App;
