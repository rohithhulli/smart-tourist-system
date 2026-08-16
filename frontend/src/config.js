// Central API base URL.
// In development, Vite proxies `/api` to the FastAPI backend (see vite.config.js),
// so relative URLs work and no CORS issues arise. For a separate deployment,
// set VITE_API_BASE_URL to the backend origin.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
