# Notes Application

A full-stack note management platform that pairs a Django REST API with a Next.js 14 client, wrapped in a cohesive design system and validated through automated tests.

## Process Summary
- Start with the data contract: model notes, categories, and auth flows inside Django, expose typed endpoints, and document them via OpenAPI.
- Mirror the contract in the Next.js app, driving UI work from the server schema and reusing a shared design system (Shadcn + Tailwind) to keep screens consistent.
- Close the loop with quality gates: Playwright seeds realistic fixtures through the API, pytest tracks coverage (currently 89 percent across 32 tests), and Make targets orchestrate local, Docker, and CI workflows.

## Architecture
- **Backend**: Django REST Framework, PostgreSQL, JWT auth, packaged via `uv` for deterministic environments.
- **Frontend**: Next.js App Router, TypeScript, Zustand for client state, Tailwind CSS, Shadcn UI components, and Radix primitives.
- **Infrastructure**: Docker Compose for local orchestration, Makefile for developer ergonomics, and Playwright for end-to-end validation.

## Local Development
### Prerequisites
- Docker and Docker Compose
- Node.js 22+
- Python 3.12+ with `uv`

### Quick Start with Docker Compose
```bash
git clone <repository-url>
cd notes-app

# Create environment file
cat > .env << EOF
POSTGRES_DB=notes_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DJANGO_SECRET_KEY=your-secret-key-change-in-production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
EOF

# Start all services (backend, frontend, postgres, redis)
docker compose up --build
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger UI): http://localhost:8000/api/docs/
- API Docs (ReDoc): http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

### Manual Backend Setup (without Docker)
```bash
cd backend
uv python install 3.12
uv venv
uv pip install -e ".[dev]"
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

### Manual Frontend Setup (without Docker)
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose Services
The `docker-compose.yml` includes:
- **db**: PostgreSQL 15 database (port 5438)
- **redis**: Redis 7 for caching (port 6379)
- **backend**: Django REST API (port 8000)
- **frontend**: Next.js app (port 3000)

Useful commands:
```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild and start
docker compose up --build

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Testing and Coverage
- **Make Targets**: `make test`, `make backend-test`, `make frontend-test`, `make test-coverage`.
- **Backend**: `pytest --cov=apps --cov-report=html` (current coverage 100%, 41 tests covering all authentication, notes CRUD, models, serializers, and management commands).
- **Frontend Unit/Integration**: `npm test`, `npm run lint`, `npm run format`.
- **Playwright E2E** (frontend/e2e):
  - `npm run test:e2e`
  - `npm run test:e2e:ui`
  - `npm run test:e2e:headed`
  - `npm run test:e2e:debug`
  - `npm run test:e2e:report`
- E2E suites authenticate via `e2e/auth.setup.ts`, seed four categories with two notes each, and store browser state in `playwright/.auth/user.json`. Provide `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD` to reuse credentials, otherwise a disposable user is created.

## Design and Technical Decisions
- **Layered Error Handling**: Network concerns are normalized in `src/lib/api-fetch.ts`, `(notes)/layout.tsx` catches failures before rendering children, and `(notes)/error.tsx` renders the `ServerError` component for in-route issues. This prevents cascading failures and gives users an actionable retry flow.
- **State Management**: `useStore` (Zustand) persists structural data such as categories and cached notes while keeping transient UI (dialogs, editing IDs) ephemeral. Persistence uses the `notes-storage` key to survive refreshes.
- **Parallel Route Modals**: Notes open in a Radix Dialog that is driven either by intercepted routes (`app/(notes)/@modal/(.)/[category]/[noteId]`) or full-page routes (`app/(notes)/[category]/[noteId]`). Playwright targets the first active dialog to account for both render paths.
- **Design System**: Components live under `src/components`, combining Shadcn primitives with project-specific elements (NoteCard, NoteDialog, CategorySelect, auth forms). Colors follow the primary/secondary/accent palette defined in `globals.css`.
- **Authentication Surfaces**: `/auth/login` and `/auth/signup` mirror the Figma reference with warm neutrals, serif headings, and copy such as “Yay, You're Back!” while exposing hooks for API integration and follow-on features (remember me, password strength, social login).
- **Routing**: Category and note routes use readable slugs (`/[category]`, `/[category]/[noteId]`) instead of numeric identifiers, keeping URLs stable and SEO friendly.
- **Data Resilience**: API helpers rethrow true network failures (tagged with `isNetworkError`) and fall back to safe defaults for other errors so primary flows remain responsive even if a downstream dependency degrades.

## Frontend Implementation Notes
- `NotesClient` renders the card grid, coordinates dialog state, and avoids double-opening when a note route is active.
- The `Header` component creates new draft notes by seeding `useStore` with an empty `DialogNote`.
- Skeleton loading lives in `app/(notes)/loading.tsx` and mimics the card grid for smoother perceived performance.
- Component documentation, usage samples, and customization guidance are reflected here so separate component READMEs are no longer necessary.

## Backend Implementation Notes
- Apps: `authentication`, `notes`, and `core` sit under `backend/apps`. Configuration in `backend/config` separates environment-specific settings.
- Environment variables (database, Django, JWT, CORS) live in `.env`; defaults are provided in the sample file.
- API documentation: Swagger UI at `http://localhost:8000/api/docs/`, ReDoc at `http://localhost:8000/api/redoc/`, and the raw OpenAPI schema at `http://localhost:8000/api/schema/`.
- Docker images use the uv-based Dockerfile for faster, reproducible builds; run with `docker build -t notes-backend .` and `docker run -p 8000:8000 --env-file .env notes-backend`.

## AI Tool Usage

I used AI tools throughout this project to speed up debugging and documentation work, but kept all the important architectural and design decisions in my own hands.

### Test Development and Debugging
- **Codex** was really helpful for catching test bugs I would've spent hours tracking down manually - things like async timing issues in Playwright tests, fixture teardown problems in pytest, and edge cases in assertions
- Used it to generate the initial structure for test files based on the API endpoints and component props, then filled in the actual logic and assertions myself
- It pointed out gaps in test coverage that I hadn't thought about (error states, boundary conditions), which I then wrote tests for

### Documentation and Technical Writing
- **Claude Code** helped me turn my rough notes and scattered comments into proper markdown documentation with consistent formatting
- When I needed to explain complex patterns like the parallel route modals or error handling strategy, I'd have it draft an explanation first, then I'd rewrite it in my own words to make sure it was accurate
- Saved a lot of time on formatting code blocks, creating tables, and writing command examples - the AI would generate a first pass and I'd verify everything against the actual code

### Code Explanation and Onboarding Materials
- Used AI to write initial drafts of technical explanations for patterns I implemented (DRF serializers, Next.js routing, Zustand store setup)
- Had it generate inline comments and JSDoc annotations, which I then reviewed and edited to make sure they actually made sense
- Built the README structure with AI help, but I double-checked every command, path, and reference to make sure they were correct
