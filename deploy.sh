#!/bin/bash

# Configuration
HOST="44.203.229.10"
USER="ubuntu"
KEY_ARG=""

# Parse Key Argument
while getopts "i:" opt; do
  case $opt in
    i) KEY_ARG="-i $OPTARG" ;;
  esac
done

echo "🚀 Deploying to $HOST..."

# 0. Build Frontend
echo "📦 Building Frontend..."
npm run build

# 1. Staging Directories
echo "📂 Preparing staging areas..."
ssh $KEY_ARG $USER@$HOST "mkdir -p ~/drugsafety/dist"

# 2. Upload Backend
echo "📤 Uploading Backend Service..."
scp $KEY_ARG api_service.py $USER@$HOST:~/drugsafety/

# 3. Upload Frontend Build
echo "📤 Uploading Frontend Build..."
# Clean remote staging first
ssh $KEY_ARG $USER@$HOST "rm -rf ~/drugsafety/dist/*"
scp $KEY_ARG -r dist/* $USER@$HOST:~/drugsafety/dist/

# 4. Deploy & Restart
echo "🔄 Deploying and Restarting Services..."
ssh $KEY_ARG $USER@$HOST <<EOF
    # Deploy Frontend to Nginx root
    sudo cp -r ~/drugsafety/dist/* /var/www/html/
    
    # Restart Backend Service
    sudo systemctl restart drugsafety-backend
    
    # Check status
    sudo systemctl status drugsafety-backend --no-pager | head -n 5
EOF

echo "✅ Deployment Complete!"
echo "🌍 Live at: http://44.203.229.10.nip.io"
