import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

// Connect to your Socket.IO server
// Replace with your server URL if it's not the same origin
const socket = io('http://localhost:5000')

function App() {
  const [message, setMessage] = useState('Test World')
  const [imageData, setImageData] = useState(null)

  useEffect(() => {
    // Listen for the 'update-text' event from the server
    socket.on('update_text', (data) => {
      setMessage(data['data']) // Update state with new text
    })

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
