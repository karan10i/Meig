#!/bin/bash
set -e

PYTHON="${PYTHON:-.venv/bin/python3}"
if [ ! -f "$PYTHON" ]; then
  PYTHON=python3
fi

echo "Starting Flask..."
"$PYTHON" main.py &
FLASK_PID=$!

echo "Waiting for Flask to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:5001/health > /dev/null 2>&1; then
    echo "Flask is ready."
    break
  fi
  if ! kill -0 $FLASK_PID 2>/dev/null; then
    echo "Flask process died. Check logs above."
    exit 1
  fi
  sleep 1
done

echo "Starting Node.js..."
node index.js &
NODE_PID=$!

# Wait for both processes
wait $FLASK_PID $NODE_PID
