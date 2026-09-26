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
        "name": "Tamil Nadu Climate-Adjusted Property Valuation & Intelligence API",
        "message": "Tamil Nadu Climate-Adjusted Property Valuation API running",
        "status": "running",
        "service": "property_valuation",
        "version": "1.0.0-mvp",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


from app.schemas.property import PropertyPredictionInput, PropertyPredictionResponse
from app.api.v1.routes import predict_property_endpoint


@app.post("/predict", response_model=PropertyPredictionResponse)
async def root_predict(property: PropertyPredictionInput):
    """Direct root predict endpoint matching Tamil Nadu Climate-Property specification."""
    return await predict_property_endpoint(property)

