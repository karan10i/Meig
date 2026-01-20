#!/bin/bash
set -e

echo "Starting Flask..."
python3 main.py &
FLASK_PID=$!

echo "Starting Node.js..."
node index.js &
NODE_PID=$!

# Wait for both processes
wait $FLASK_PID $NODE_PID
