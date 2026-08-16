# Smart Tourist Recommendation System (ExploreIndiaAI)

An AI-powered tourist assistant for Karnataka: live GPS nearby discovery, content-based
recommendations with explainable scores, multi-stop itinerary planning, and a full
authentication flow.

## Features

- **Authentication** — signup / login / logout with bcrypt-hashed passwords and an
  HttpOnly cookie JWT session (no tokens stored in localStorage).
- **Account area** — profile page (edit name/email, member-since, trip & favorite
  counts), favorites page, and My Trips.
- **AI recommendations** — TF-IDF + cosine-similarity engine with a `match_reason`
  explanation and a 4-part `score_breakdown` (content, quality, budget, distance).
- **Itinerary planner** — pick places, budget, dates and interests to get a day-by-day
  itinerary with time slots, per-leg distances, costs, and per-day themes.
- **Live nearby services** — proxy over Overpass/OpenStreetMap for hotels, restaurants,
  hospitals, transport, ATMs and fuel with a fallback list of mirrors and TTL caching.
- **Interactive map** — Leaflet map with route polyline, waypoints, and live data toggles.
- **Curated dataset** — 99 real Karnataka places across 49 cities and 16 categories,
  seeded idempotently into SQLite; all images render with a graceful fallback.

## Tech Stack

| Layer      | Stack |
|------------|-------|
| Frontend   | React 18 + Vite, React Router, Tailwind CSS, Lucide icons, Leaflet |
| Backend    | Python 3.13 + FastAPI, SQLAlchemy 2, Pydantic v2 |
| ML Engine  | scikit-learn (TF-IDF), pandas, numpy |
| Data       | SQLite (SQLAlchemy ORM), canonical dataset in `backend/app/data/` |
| Auth       | PyJWT (HS256) in HttpOnly cookie, bcrypt |
| External   | Overpass / OpenStreetMap API (no key required) |

## Project Structure

```
smart-tourist-system/
├── backend/
│   ├── main.py                 # FastAPI app (run with `main:app`)
│   ├── requirements.txt        # runtime deps
│   ├── requirements-dev.txt    # + pytest, httpx
│   ├── app/
│   │   ├── api/                # auth, places, planner, trips, favorites, meta, nearby
│   │   ├── core/               # settings (env-driven), security (JWT + cookies)
│   │   ├── data/               # canonical 99-place Karnataka dataset
│   │   ├── models/             # SQLAlchemy ORM + pydantic schemas
│   │   └── ml_engine/          # ContentBasedRecommender, itinerary builder
│   └── tests/                  # pytest API suite (17 tests)
└── frontend/
    ├── src/
    │   ├── pages/              # Home, Dashboard, NearbyPlaces, PlanTrip, MyTrips,
    │   │                       # TripDetail, MapViewPage, Favorites, Profile, Contact,
    │   │                       # Login, Signup
    │   ├── components/         # Navbar, Sidebar, SmartImage, PlaceCard, TripTimeline,
    │   │                       # RecommendationCard, PlaceDetailsModal, ...
    │   └── context/            # AuthContext, TripContext
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows; on macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env             # then set a strong JWT_SECRET
uvicorn main:app --reload        # http://127.0.0.1:8000  (docs at /docs)
```

> Note: the app module is `main` at the backend root — always run
> `uvicorn main:app` (not `app.main:app`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173  (proxies /api → :8000)
```

### 3. Run tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests -v
```

Tests use a throwaway `test_smarttourist.db` and never touch real data.

## Environment Variables (`backend/.env`)

| Variable          | Default | Purpose |
|-------------------|---------|---------|
| `DATABASE_URL`    | `sqlite:///./smarttourist.db` | SQLAlchemy connection string |
| `JWT_SECRET`      | (warns on known defaults) | Signing key; generate with `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `JWT_ALGORITHM`   | `HS256` | JWT algorithm |
| `JWT_EXPIRE_MINUTES` | `60` | Session lifetime |
| `FRONTEND_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list (credentials) |
| `COOKIE_SECURE`   | `false` | Set `true` behind HTTPS |
| `OVERPASS_URLS`   | 4 public mirrors | Overpass endpoints for nearby services |

## Deployment Notes

- **Production backend**: serve with `uvicorn main:app` (or `gunicorn -k uvicorn.workers.UvicornWorker main:app`)
  behind HTTPS. Set `COOKIE_SECURE=true`, a real `JWT_SECRET`, and restrict
  `FRONTEND_ORIGIN` to your deployed origin.
- **Production frontend**: `npm run build` → serve `frontend/dist` from any static host
  (Nginx, Vercel, Netlify). Configure the host to proxy `/api` to the backend or point
  `API_BASE_URL` at the backend origin.
- **SQLite**: fine for single-instance deployments. For horizontal scaling, point
  `DATABASE_URL` at PostgreSQL (SQLAlchemy will handle it).
- **Overpass rate limits**: first uncached nearby-service calls can take 7-35s; results
  are cached for 10 minutes and multiple mirrors are tried automatically.
- **Data**: the tourist_places table is seeded idempotently on startup — new places in
  the dataset are upserted without dropping existing rows.
