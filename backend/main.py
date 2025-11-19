import threading
from flask import Flask, send_from_directory
from flask_socketio import SocketIO
import os

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

    # Example Socket.IO event
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        socketio.emit('message', {'data': 'Hello from server!'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
    
    @socketio.on('message')
    def handle_test_event(data):
        print(f'Received test_event: {data}')
        socketio.emit('update_text', {'data': 'Server received your message!'})

    print("Socket.IO server running on port 5000")
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

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
