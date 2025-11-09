#!/bin/bash

# Setup development environment for Notes Application

set -e

echo "🚀 Setting up Notes development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before running the application."
fi

# Ensure uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Install it from https://docs.astral.sh/uv/getting-started/ before continuing."
    exit 1
fi

# Backend setup
echo "🔧 Setting up backend..."
cd backend

echo "🐍 Ensuring Python 3.11 is available via uv..."
uv python install 3.11 >/dev/null

if [ ! -d ".venv" ]; then
    echo "🧰 Creating managed virtual environment..."
    uv venv
else
    echo "🔁 Reusing existing .venv environment..."
fi

echo "📦 Installing backend dependencies with uv..."
uv pip install -e ".[dev]"

echo "🔨 Installing pre-commit hooks..."
.venv/bin/pre-commit install

echo "✅ Backend setup complete!"

cd ..

# Frontend setup
echo "🔧 Setting up frontend..."
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start development environment:"
echo "   make dev-up"
echo ""
echo "Available commands:"
echo "   make dev-up     - Start development environment with Docker"
echo "   make dev-down   - Stop development environment"
echo "   make test       - Run all tests"
echo "   make clean      - Clean up containers and volumes"
echo ""
