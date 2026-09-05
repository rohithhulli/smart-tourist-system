"""
Root server entrypoint for Uvicorn and development servers.

Exports the FastAPI instance from `app.main:app`.
"""
from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="[IP_ADDRESS]", port=8000, reload=True)
