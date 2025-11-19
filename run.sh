#!/bin/bash

# === CONFIG ===
PI_USER="micah"               # Pi username
PI_HOST="raspberrypi.local"       # Pi IP address
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"  # folder this script is in
REMOTE_DIR="/home/micah/git/cj7"    # target dir on Pi
PORT=8080                     # port to free

# === CREATE REMOTE DIRECTORY ===
echo "Creating remote directory $REMOTE_DIR on $PI_HOST ..."
ssh "$PI_USER@$PI_HOST" "mkdir -p $REMOTE_DIR"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create remote directory."
    exit 1
fi

# === COPY PROJECT TO PI ===
echo "Copying $LOCAL_DIR to $PI_USER@$PI_HOST:$REMOTE_DIR ..."
scp -r "$LOCAL_DIR"/* "$PI_USER@$PI_HOST:$REMOTE_DIR"
if [ $? -ne 0 ]; then
    echo "❌ Failed to copy project."
    exit 1
fi
echo "✅ Project copied successfully."

# === KILL ANY PROCESS USING PORT 8080 ===
echo "Checking for processes using port $PORT on $PI_HOST ..."
ssh "$PI_USER@$PI_HOST" "
PID=\$(lsof -ti tcp:$PORT)
if [ -n \"\$PID\" ]; then
    echo \"Killing process \$PID using port $PORT...\"
    kill -9 \$PID
else
    echo \"No process using port $PORT.\"
fi
"

# === RUN MAIN.PY ON PI USING .venv ===
ssh "$PI_USER@$PI_HOST" "cd $REMOTE_DIR && bash launch.sh"

if [ $? -ne 0 ]; then
    echo "❌ Failed to run script on Pi."
    exit 1
fi
echo "✅ Script executed successfully."
