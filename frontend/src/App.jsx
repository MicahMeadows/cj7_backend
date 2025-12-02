import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import GoogleMap from './GoogleMap';
import GreenMonochromeFilter from './GreenMonochromeFilter';
import Constants from './const';
import SpeedBar from './SpeedBar.jsx';
import { Textfit } from 'react-textfit';
import ScrollingText from './ScrollingText.jsx';
import TrackProgress from './TrackProgress.jsx';
import CjArt from './CjArt.jsx';
import VolumeBar from './VolumeBar.jsx';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// Connect to your Socket.IO server
const socket = io('http://127.0.0.1:8089');

function formatTimeLeft(seconds) {
  if (!seconds || seconds < 0) return "0min";

  if (seconds > 0 && seconds < 60) return "1min"; // show 1 min for any seconds under a minute

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} min`;
  }

  return `${minutes}min`;
}




function formatDistanceLeft(meters) {
  if (!meters || meters < 0) return "0mi";

  const miles = meters / 1609.34;
  return `${miles.toFixed(1)}mi`;
}

function App() {
  const [volume, setVolume] = useState(0);
  const [androidConnected, setAndroidConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [songData, setSongData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [curLatLong, setLatLong] = useState([38.051524, -84.442025]);
  const mapRef = useRef(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [distanceLeft, setDistanceLeft] = useState(null);
  const [currentBearing, setCurrentBearing] = useState(0);
  const [turnByTurn, setTurnByTurn] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHour, setCurrentHour] = useState(0);
  const [currentMin, setCurrentMin] = useState(0);
  const [currentSec, setCurrentSec] = useState(0); // optional, for seconds
  const [currentDay, setCurrentDay] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(0); // 1-12
  const [currentYear, setCurrentYear] = useState(0);


  function getFormattedTime() {
    // Format month and day with leading zeros
    const month = currentMonth.toString().padStart(2, '0');
    const day = currentDay.toString().padStart(2, '0');
    const year = currentYear;

    // Convert 24-hour to 12-hour format
    let hour12 = currentHour % 12;
    hour12 = hour12 === 0 ? 12 : hour12; // handle midnight/noon
    const ampm = currentHour >= 12 ? 'PM' : 'AM';

    // Pad minutes
    const minutes = currentMin.toString().padStart(2, '0');

    return `${month}/${day}/${year} - ${hour12}:${minutes}${ampm}`;
  }


  function getArrivalTime(seconds) {
    // Total minutes to add
    const totalMinutesToAdd = Math.floor(seconds / 60);
    const totalSecondsRemaining = seconds % 60;

    // Calculate new hour and minute
    let newMin = currentMin + totalMinutesToAdd;
    let newHour = currentHour + Math.floor(newMin / 60);
    newMin = newMin % 60;
    newHour = newHour % 24; // wrap around 24-hour format

    // Convert to 12-hour format with AM/PM
    const ampm = newHour >= 12 ? 'pm' : 'am';
    const hour12 = newHour % 12 === 0 ? 12 : newHour % 12;

    // Pad minutes with leading zero if needed
    const minPadded = newMin.toString().padStart(2, '0');

    return `${hour12}:${minPadded}${ampm}`;
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMin(now.getMinutes());
      setCurrentSec(now.getSeconds()); // optional

      setCurrentDay(now.getDate());
      setCurrentMonth(now.getMonth() + 1); // JS months are 0-11
      setCurrentYear(now.getFullYear());
    };

    // Update immediately
    updateTime();

    // Update every second
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  function requestInitialData() {
      socket.emit('reload_page');
  }

  function phoneDisconnected() {
      setRouteSegments([]);
      setTimeLeft(0);
      setDistanceLeft(0);
      setTurnByTurn(null);
      setSongData(null);
      setImageData(null);
      setBatteryLevel(0);
  }


  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`requsting page reload`);
      requestInitialData();
    });


    socket.on('disconnect', () => {
      setIsConnected(false);
      phoneDisconnected();
    });


    socket.on('web_volume_change', (data) => {
      console.log('Volume change data received:', data);
      setVolume(data);
    });

    socket.on('web_android_connected', () => {
      console.log('Android device connected');
      setAndroidConnected(true);
      requestInitialData();
    });

    socket.on('web_android_disconnected', () => {
      console.log('Android device disconnected');
      setAndroidConnected(false);
      phoneDisconnected();
    });

    socket.on('web_battery_level', (data) => {
      setBatteryLevel(data);
    });

    socket.on('web_end_route', () => {
      setRouteSegments([]);
      setTimeLeft(0);
      setDistanceLeft(0);
      setTurnByTurn(null);
    });

    socket.on('web_song_change', (data) => {
      console.log('Song change data received:', data);
      setSongData(data)
    })

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
    <div className="App" style={{
      // height: "100vh",
    }}>
      <div
        style={{
          aspectRatio: "16 / 9",
          width: "100vw",
          // height: "100%",
          // height: "100vh",
          backgroundColor: "black",
          overflow: "hidden",
          padding: "20px",
          paddingTop: "10px",
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: "100%",
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: "5px 0",
              color: Constants.RETRO_GREEN,
              paddingBottom: "5px",
            }}>
            <div style={{
              margin: "0",
              padding: "0",
              lineHeight: ".7",
              fontSize: "2.5rem",
            }}>1985 Jeep CJ7</div>
            <div style={{
              margin: "0",
              padding: "0",
              lineHeight: ".7",
              fontSize: "2.0rem",
            }}> {getFormattedTime()}</div>
          </div>
          <hr style={{ width: "100%", borderTop: `3px solid ${Constants.RETRO_GREEN}`, color: "transparent", padding: "5px" }} />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,       // let it grow to remaining space
          }}>
            <div style={{
              width: "12%",
              border: `3px solid ${Constants.RETRO_GREEN}`,
              boxSizing: "border-box",
              // margin: "0",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}>
                <div style={{
                  flexGrow: 1,
                  padding: "10px 6px",
                }}>
                  <SpeedBar value={currentSpeed} color={Constants.RETRO_GREEN}></SpeedBar>
                </div>
                <hr style={{ width: "100%", borderTop: `3px solid ${Constants.RETRO_GREEN}`, color: "transparent", padding: "0" }} />
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
                    <span style={{ fontSize: '7rem', lineHeight: "1", color: Constants.RETRO_GREEN }}>{currentSpeed}</span>

                    <div style={{ flex: 1 }}></div>

                    {/* Right MPH */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ display: 'inline-block', lineHeight: '0.7', fontSize: '2rem', paddingTop: '8px', color: Constants.RETRO_GREEN }}>
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
              width: "56%",
              border: `3px solid ${Constants.RETRO_GREEN}`,
              boxSizing: "border-box",
              margin: "0",
              display: "flex",
              flexDirection: "column",
              height: "100%",       // <-- ensure parent has 100% of available height
              position: "relative",
              margin: "0 10px"
            }}>

              <GreenMonochromeFilter
                initialBrightness={.9}
                initialContrast={1.1}
                initialGrayscale={1}
                initialHue={90}
                initialInvert={1}
                initialSaturate={20}
                initialSepia={1}
                style={{ height: "100%", width: "100%" }}
              >
                <GoogleMap
                  ref={mapRef}
                  center={{ lat: curLatLong[0], lng: curLatLong[1] }}
                  zoom={18}
                  bearing={currentBearing}
                  segments={routeSegments}
                  style={{ flex: 1, height: "100%" }} // fills parent
                />
              </GreenMonochromeFilter>
              {turnByTurn && (
                  <div
                    style={{
                      position: "relative",
                      left: 0,
                      right: 0,
                      borderTop: `3px solid ${Constants.RETRO_GREEN}`, // <-- top border only
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        height: "90px",          // give parent a height
                        boxSizing: "border-box",  // include borders/padding in height
                      }}
                    >
                      <div
                        style={{
                          width: "20%",
                          height: "100%",          // match parent height
                          boxSizing: "border-box",
                          borderRight: `3px solid ${Constants.RETRO_GREEN}`, // right-side border
                        }}
                      >
                        <div style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "100%",
                          height: "100%",
                          alignItems: "space-between",
                        }}>
                          <div style={{ flex: 1, display: "flex", paddingLeft: "8px", alignContent: "center", alignItems: "center" }}>
                            <span style={{ display: 'inline-block', lineHeight: '0.65', fontSize: '1.7rem', color: Constants.RETRO_GREEN }}>
                              <span>S</span><br />
                              <span>T</span><br />
                              <span>E</span><br />
                              <span>P</span>
                            </span>
                          </div>
                          {turnByTurn && turnByTurn.meters && turnByTurn.seconds && (
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "right",
                              fontSize: "2.1rem",
                              lineHeight: "1",
                              height: "100%",
                              color: Constants.RETRO_GREEN,
                              marginRight: "10px"
                            }}>
                              {formatDistanceLeft(turnByTurn.meters)}
                              <br />
                              {formatTimeLeft(turnByTurn.seconds)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignContent: "center",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "60%",
                          height: "100%",
                          boxSizing: "border-box",
                          borderRight: `3px solid ${Constants.RETRO_GREEN}`, // right-side border
                        }}
                      >
                        <div style={{
                          fontSize: "2rem",
                          marginBottom: "2px",
                          marginTop: "5px",
                          lineHeight: "1.0",
                          fontWeight: "bold",
                          color: Constants.RETRO_GREEN,
                          // }}>NEXT DIRECTION</div>
                        }}> {
                            turnByTurn && turnByTurn.maneuver && (
                              Constants.getManeuverName(turnByTurn.maneuver).toUpperCase()
                            )
                          }</div>
                        {turnByTurn && turnByTurn.road && (
                          <Textfit mode="multi" max={40} style={{
                            width: "90%",
                            height: "80%",
                            lineHeight: "1.0",
                            color: Constants.RETRO_GREEN,
                          }}>
                            {turnByTurn.road}

                          </Textfit>
                        )}
                      </div>
                      <div
                        style={{
                          height: "100%",
                          width: "20%",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "100%",
                          height: "100%",
                          alignItems: "space-between",
                        }}>
                          <div style={{ flex: 1, display: "flex", paddingLeft: "8px", alignContent: "center", alignItems: "center" }}>
                            <span style={{ display: 'inline-block', lineHeight: '0.65', fontSize: '1.7rem', color: Constants.RETRO_GREEN }}>
                              <span>E</span><br />
                              <span>T</span><br />
                              <span>A</span>
                            </span>
                          </div>
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            height: "100%",
                            marginRight: "10px",
                            fontSize: "2.1rem",
                            lineHeight: "1",
                            height: "100%",
                            color: Constants.RETRO_GREEN,
                          }}>
                            {distanceLeft && (
                              <div>
                                {formatDistanceLeft(distanceLeft)}
                              </div>
                            )
                            }
                            {
                              timeLeft && (
                                <div>
                                  {/* {formatTimeLeft(timeLeft) } */}
                                  {getArrivalTime(timeLeft)}

                                </div>
                              )
                            }
                          </div>

                        </div>

                      </div>
                    </div>

                  </div>
                )}
                
            </div>

            <div style={{
              width: "33%",
              // border: `3px solid ${Constants.RETRO_GREEN}`,
              boxSizing: "border-box",
              margin: "0",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }}>
                <div style={{
                  border: `3px solid ${Constants.RETRO_GREEN}`,
                  boxSizing: "border-box",
                  height: "45%",
                  marginBottom: "10px",
                }}>
                  { androidConnected && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    padding: "10px",
                  }}>
                    <div style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}>
                      {imageData && (
                        <div style={{ textAlign: 'center', width: "140px", height: "140px", marginRight: "20px", flexShrink: 0 }}>
                          <GreenMonochromeFilter
                            // initialBrightness={.5}
                            initialContrast={2.8}
                            initialGrayscale={1}
                            initialHue={90}
                            initialInvert={0}
                            initialSaturate={17.4}
                            initialSepia={.55}
                            initialBrightness={0}
                            maxBrightness={1.2}
                          >

                            <img
                              src={`data:image/jpeg;base64,${imageData}`}
                              crossOrigin="anonymous"
                              alt="Album Art"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </GreenMonochromeFilter>
                        </div>
                      )}
                      {songData && (
                        <div style={{
                          paddingTop: "10px",
                          display: "flex",
                          flexDirection: "column",
                          fontSize: "2rem",
                          marginRight: "10px",
                          lineHeight: ".8",
                          height: "100%",
                          gap: "15px",
                          justifyContent: "space-between",
                          color: Constants.RETRO_GREEN,
                          overflow: "hidden",
                        }}>
                          <ScrollingText >{songData.track.name}</ScrollingText>
                          {/* <ScrollingText>{ "some long ass song name" }</ScrollingText> */}
                          <ScrollingText>{songData.track.album.name}</ScrollingText>
                          <ScrollingText>{songData.track.artist.name}</ScrollingText>
                        </div>
                      )}
                    </div>
                    <div style={{
                      height: "30px"
                    }} />
                    <TrackProgress playerState={songData} bgColor={"black"} accentColor={Constants.RETRO_GREEN} />
                    <div style={{
                      height: '20px'
                    }}/>
                    <VolumeBar accentColor={Constants.RETRO_GREEN} bgColor='black' value={volume}/>

                  </div>)}
                </div>
                <div style={{
                  border: `3px solid ${Constants.RETRO_GREEN}`,
                  boxSizing: "border-box",
                  height: "45%",
                  marginBottom: "10px",

                  /* Center content */
                  display: 'flex',
                  justifyContent: 'center', // horizontal centering
                  alignItems: 'center',     // vertical centering
                  textAlign: 'center',     // center ASCII inside inner div
                }}>
                <CjArt />
                </div>
                <div style={{
                  border: `3px solid ${Constants.RETRO_GREEN}`,
                  boxSizing: "border-box",
                  height: "10%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 20px",
                }}>
                  <div style={{
                    color: Constants.RETRO_GREEN,
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}>
                    Phone ({ androidConnected ? 'yes' : 'no' })
                  </div>
                  <div style={{
                    color: Constants.RETRO_GREEN,
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}>
                    Battery: {batteryLevel}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
