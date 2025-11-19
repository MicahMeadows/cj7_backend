import cv2
import asyncio
import threading
from flask import Flask, Response

def run_web_app():
    app = Flask(__name__)

    # === Find the first available camera ===
    def find_first_camera(max_index=10):
        for i in range(max_index):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                print(f"Using camera {i}")
                return cap
            cap.release()
        return None

    cap = find_first_camera()

    def generate_frames():
        if cap is not None:
            while True:
                success, frame = cap.read()
                if not success:
                    break
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                # Yield in MJPEG format
                yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    @app.route('/video_feed')
    def video_feed():
        return Response(generate_frames(),
                        mimetype='multipart/x-mixed-replace; boundary=frame')

    @app.route('/')
    def index():
        return '''
        <html>
        <head>
            <title>Live Camera</title>
            <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                background: #111;
            }
            body {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover; /* ensures the image fills without distortion */
            }
            </style>
        </head>
        <body>
            <img src="/video_feed" />
        </body>
        </html>

        '''
    try:
        app.run(host='0.0.0.0', port=8080, debug=False)
    except Exception as e:
        print(f"Web app error: {e}")

def run_bt_thread():
    print(f'hello bt thread')

class BackendManager:
    def main(self):
        
        

if __name__ == '__main__':
    web_thread = threading.Thread(target=run_web_app, daemon=True)
    print('starting web thread')

    web_thread.start()
    
    web_thread.join()
