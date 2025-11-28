import threading
from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO
import os

SOCKET_IO_PORT = 8089

# === Flask app for React static files ===
def create_flask_app():
    app = Flask(__name__, static_folder='./dist', static_url_path='')

    # Serve React index.html for root
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    # Fallback for React routes
    @app.route('/<path:path>')
    def static_proxy(path):
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        else:
            # Serve index.html for React routing
            return send_from_directory(app.static_folder, 'index.html')

    return app

# === Web server thread ===
def run_web_app():
    app = create_flask_app()
    try:
        app.run(host='0.0.0.0', port=8080, debug=False)
    except Exception as e:
        print(f"Web app error: {e}")

# === Socket.IO server thread ===
def run_socketio_server():
    app = create_flask_app()
    socketio = SocketIO(app, cors_allowed_origins="*")  # Allow CORS for all origins

    tile_cache = {}
    pending_tile_requests = set()

    # Example Socket.IO event
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        socketio.emit('message', {'data': 'Hello from server!'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('reload_page')
    def handle_reload_page():
        print('Reload page requested')
        socketio.emit('android_reload_page', {})

    @socketio.on('android_connect')
    def android_device_connected():
        print('Android device connected')
        socketio.emit('update_text', {'data': f'Android device connected: {request.sid}'})

    @socketio.on('time_and_distance')
    def handle_time_and_distance(data):
        print('Received time and distance data')
        socketio.emit('web_time_and_distance', data)

    @socketio.on('route_segments')
    def handle_route_segments(data):
        print('Received route segments data')
        socketio.emit('web_route_segments', data)

    @socketio.on('song_change')
    def handle_song_change(data):
        print(f'Song changed to: {data}')
        socketio.emit('update_text', {'data': f'song playing now: {data}'})

    @socketio.on('album_image')
    def handle_album_image(data):
        print('Received album image data')
        socketio.emit('album_image_bitmap', data)
    
    @socketio.on('skip_song')
    def handle_skip_song():
        print('Skip song requested from Android')
        socketio.emit('skip_song')
    
    @socketio.on('web_connect')
    def web_app_connected():
        print('Web app connected')
    
    @socketio.on('message')
    def handle_test_event(data):
        print(f'Received test_event: {data}')
        socketio.emit('update_text', {'data': 'Server received your message!'})
    
    @socketio.on('tile_data')
    def handle_tile_data(data):
        x = data['x']
        y = data['y']
        zoom = data['zoom']
        tile_key = (x, y, zoom)

        print(f"Received tile {tile_key}, caching it")
        tile_cache[tile_key] = data

        # Remove from pending set
        pending_tile_requests.discard(tile_key)

        socketio.emit('web_map_tile', data)
    
    @socketio.on('location_update')
    def handle_location_update(data):
        lat = data['lat']
        lon = data['long']
        print(f"Received location update: lat={lat}, lon={lon}, bearing={data.get('bearing')}")
        socketio.emit('web_location_update', data)
    
    @socketio.on('request_tile')
    def handle_request_tiles(data):
        x = data.get('x')
        y = data.get('y')
        zoom = data.get('zoom')

        if x is None or y is None or zoom is None:
            print('Invalid tile request data')
            return

        tile_key = (x, y, zoom)
        print(f'Received request for tile {tile_key}')

        # If tile is in cache, just return it
        if tile_key in tile_cache:
            print(f"Returning tile {tile_key} from cache")
            socketio.emit('web_map_tile', tile_cache[tile_key])
            return

        # If tile is already being requested, ignore
        if tile_key in pending_tile_requests:
            print(f"Tile {tile_key} is already requested, skipping duplicate request")
            return

        # Otherwise, request tile and mark as pending
        print(f"Requesting tile {tile_key} from Android")
        pending_tile_requests.add(tile_key)
        socketio.emit('android_request_tile', {'x': x, 'y': y, 'zoom': zoom})
    
    print(f"Socket.IO server running on port {SOCKET_IO_PORT}")
    socketio.run(app, host='0.0.0.0', port=SOCKET_IO_PORT, allow_unsafe_werkzeug=True)

# === Backend manager to run both ===
class BackendManager:
    def main(self):
        web_thread = threading.Thread(target=run_web_app, daemon=True)
        socketio_thread = threading.Thread(target=run_socketio_server, daemon=True)

        web_thread.start()
        socketio_thread.start()

        web_thread.join()
        socketio_thread.join()

if __name__ == '__main__':
    manager = BackendManager()
    manager.main()
