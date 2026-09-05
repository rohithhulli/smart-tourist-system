"""
FastAPI Application Entrypoint.

Initializes the FastAPI application, registers middleware (CORS),
sets up the database lifecycle hooks, and mounts all feature routers.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import FRONTEND_ORIGINS
from app.core.database import init_db
from app.routers.auth import router as auth_router
from app.routers.destinations import router as destinations_router
from app.routers.favorites import router as favorites_router
from app.routers.meta import router as meta_router
from app.routers.nearby import router as nearby_router
from app.routers.places import router as places_router
from app.routers.planner import router as planner_router
from app.routers.trips import router as trips_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (idempotent; never drops existing data)
    init_db()
    yield


app = FastAPI(
    title="Smart Tourist System API",
    description="Intelligent itinerary planning and tourist recommendation engine for Karnataka.",
    version="2.0.0",
    lifespan=lifespan,
)

# Cross-Origin Resource Sharing (CORS) setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Feature Routers
app.include_router(auth_router)
app.include_router(destinations_router)
app.include_router(places_router)
app.include_router(planner_router)
app.include_router(trips_router)
app.include_router(favorites_router)
app.include_router(nearby_router)
app.include_router(meta_router)

# Mount recommendation router at /api/recommend for legacy compatibility
app.include_router(planner_router, prefix="/api/recommend", tags=["recommendations-legacy"])


@app.get("/")
def root():
    return {
        "status": "success",
        "service": "Smart Tourist System API",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
