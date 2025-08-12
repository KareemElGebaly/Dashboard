#!/bin/bash

echo "🚀 Starting Backend API Server"
echo "=============================="

# Navigate to server directory
cd server

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start the backend server
echo "🔥 Starting backend server on port 3001..."
npm start