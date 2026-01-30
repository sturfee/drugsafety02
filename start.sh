#!/bin/bash
export DB_HOST=drugsafety01.c9qieom8iu7y.us-east-1.rds.amazonaws.com
export DB_NAME=drugsafety
export DB_USER=drugsafety_admin
export DB_PASS=sociallistner001
export DB_PORT=5432

# Kill existing
pkill -f api_service.py || true

# Start new
nohup venv/bin/python api_service.py > api.log 2>&1 &
echo "Service started with PID $!"
