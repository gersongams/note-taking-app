.PHONY: help docker-up docker-down docker-logs docker-build db-up db-down db-logs backend-setup frontend-setup backend-dev frontend-dev backend-migrate test clean

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Docker Compose (Full Stack):"
	@echo "  docker-up       - Start all services (frontend, backend, db, redis)"
	@echo "  docker-down     - Stop all services"
	@echo "  docker-logs     - View all service logs"
	@echo "  docker-build    - Rebuild and start all services"
	@echo ""
	@echo "Database (Docker):"
	@echo "  db-up           - Start PostgreSQL database only"
	@echo "  db-down         - Stop database"
	@echo "  db-logs         - View database logs"
	@echo ""
	@echo "Setup:"
	@echo "  backend-setup   - Set up backend dependencies"
	@echo "  frontend-setup  - Set up frontend dependencies"
	@echo ""
	@echo "Development (Local):"
	@echo "  backend-dev     - Run backend development server"
	@echo "  frontend-dev    - Run frontend development server"
	@echo "  backend-migrate - Run database migrations"
	@echo "  backend-seed    - Create default categories for a user"
	@echo ""
	@echo "Testing:"
	@echo "  test            - Run all tests"
	@echo "  backend-test    - Run backend tests"
	@echo "  frontend-test   - Run frontend tests"
	@echo "  test-coverage   - Run tests with coverage"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean           - Clean up containers and volumes"

# Docker Compose - Full Stack
docker-up:
	docker compose up -d
	@echo "✓ All services started:"
	@echo "  - Frontend: http://localhost:3000"
	@echo "  - Backend API: http://localhost:8000"
	@echo "  - Database: localhost:5438"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "View logs: make docker-logs"

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-build:
	docker compose up --build -d
	@echo "✓ Services rebuilt and started"

# Database with Docker
db-up:
	docker compose up -d db redis
	@echo "✓ Database and Redis started"
	@echo "  - PostgreSQL: localhost:5438"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run backend: make backend-setup && make backend-migrate && make backend-dev"
	@echo "  2. Run frontend: make frontend-setup && make frontend-dev"

db-down:
	docker compose down

db-logs:
	docker compose logs -f db

# Local development setup
backend-setup:
	cd backend && uv python install 3.12 >/dev/null
	cd backend && uv venv
	cd backend && uv pip install -e ".[dev]"

frontend-setup:
	cd frontend && npm install

backend-migrate:
	cd backend && .venv/bin/python manage.py migrate

backend-seed:
	@echo "Creating default categories..."
	@read -p "Enter user email: " email; \
	cd backend && .venv/bin/python manage.py seed_categories --email $$email

backend-dev:
	cd backend && .venv/bin/python manage.py runserver

frontend-dev:
	cd frontend && npm run dev

# Testing
test: backend-test frontend-test

backend-test:
	cd backend && .venv/bin/pytest

frontend-test:
	cd frontend && npm test

test-coverage:
	cd backend && .venv/bin/pytest --cov=apps --cov-report=html
	cd frontend && npm run test:coverage

# Cleanup
clean:
	docker compose down -v
	@echo "✓ All containers stopped and volumes removed"
