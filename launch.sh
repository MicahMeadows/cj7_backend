#!/bin/bash
# launch.sh — entrypoint for your project

# Exit immediately if a command fails
set -e

# === CONFIG ===
MAIN_SCRIPT="backend/main.py"  # main Python script

echo "installing packages"
pip3 install -r backend/requirements.txt --break-system-packages

# === RUN MAIN SCRIPT ===
echo "Running $MAIN_SCRIPT ..."
python3 "$MAIN_SCRIPT" &

DISPLAY=:0 chromium --kiosk "http://localhost:8080"

# === OPTIONAL: post-launch commands ===
# e.g., cleanup, logging, etc.
