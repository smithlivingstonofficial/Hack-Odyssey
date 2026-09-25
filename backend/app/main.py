"""
Climate Property Intelligence — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import router
from app.core.config import settings

app = FastAPI(
    title="Climate Property Intelligence API",
    description=(
        "AI and GIS-powered climate-adjusted property valuation for India. "
        "Converts physical climate exposure into property-level financial intelligence."
    ),
    version="1.0.0-mvp",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "Climate Property Intelligence API",
        "version": "1.0.0-mvp",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
