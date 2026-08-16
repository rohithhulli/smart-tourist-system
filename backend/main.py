# pyrefly: ignore [missing-import]
from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.favorites import router as favorites_router
from app.api.meta import router as meta_router
from app.api.nearby import router as nearby_router
from app.api.places import router as places_router
from app.api.planner import router as planner_router
from app.api.trips import router as trips_router
from app.core.settings import FRONTEND_ORIGINS
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (idempotent; never drops existing data).
    init_db()
    yield


app = FastAPI(
    title="Smart Tourist Recommendation System API",
    description="Intelligent AI Travel Assistant API supporting GPS nearby spots, multi-stop trip planner, and user itineraries.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS restricted to configured frontend origins so credentialed requests work.
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(places_router)
app.include_router(planner_router)
app.include_router(trips_router)
app.include_router(favorites_router)
app.include_router(meta_router)
app.include_router(nearby_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Smart Tourist Recommendation AI Backend",
        "docs_url": "http://127.0.0.1:8000/docs"
    }

@app.get("/api/status")
def api_status():
    return {
        "status": "Active",
        "message": "Backend engine is running smoothly boss!"
    }
