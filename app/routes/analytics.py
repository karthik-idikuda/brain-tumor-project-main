# app/routes/analytics.py
"""Web Analytics Module — user activity tracking and prediction statistics."""

from fastapi import APIRouter, Request
import requests
from pydantic import BaseModel

from app.utils.database import (
    get_all_predictions,
    get_prediction_stats,
    get_heatmap_data,
    save_interaction,
)

router = APIRouter(tags=["Analytics"])


class InteractionPayload(BaseModel):
    event_type: str
    page: str
    consent: bool = False


def _get_geolocation(ip: str):
    """Fetch geolocation from IP with graceful fallback."""
    response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
    data = response.json()
    if data.get("status") == "success":
        return {
            "city": data.get("city", "Unknown"),
            "country": data.get("country", "Unknown"),
            "region": data.get("regionName", "Unknown"),
            "lat": data.get("lat"),
            "lon": data.get("lon"),
        }
    return None


@router.get("/my-location/")
@router.get("/analytics/my-location/")
def get_user_location(request: Request):
    """Get the current user's geolocation based on IP address."""
    ip = request.client.host

    # For local development, get public IP
    if ip in ("127.0.0.1", "::1", "localhost"):
        try:
            ip = requests.get("https://api.ipify.org", timeout=3).text
        except Exception:
            return {"error": "Could not determine public IP"}

    try:
        geo = _get_geolocation(ip)
        if not geo:
            return {"error": "Could not determine location"}
        return {
            "ip": ip,
            "city": geo["city"],
            "country": geo["country"],
            "region": geo["region"],
            "lat": geo["lat"],
            "lon": geo["lon"],
        }
    except Exception:
        return {"error": "Location service unavailable"}


@router.post("/analytics/interaction")
def track_interaction(payload: InteractionPayload, request: Request):
    """Track anonymized interaction events with optional geolocation consent."""
    ip = request.client.host
    if ip in ("127.0.0.1", "::1", "localhost"):
        try:
            ip = requests.get("https://api.ipify.org", timeout=3).text
        except Exception:
            ip = None

    city = country = region = "Unknown"
    lat = lon = None
    if payload.consent and ip:
        try:
            geo = _get_geolocation(ip)
            if geo:
                city = geo["city"]
                country = geo["country"]
                region = geo["region"]
                lat = geo["lat"]
                lon = geo["lon"]
        except Exception:
            pass

    save_interaction(
        event_type=payload.event_type,
        page=payload.page,
        user_ip=ip if payload.consent else None,
        city=city,
        country=country,
        region=region,
        lat=lat,
        lon=lon,
        meta={"consent": payload.consent},
    )
    return {"status": "ok"}


@router.get("/analytics/predictions")
def get_predictions():
    """Get all prediction history from the database."""
    predictions = get_all_predictions()
    return {"total": len(predictions), "predictions": predictions}


@router.get("/analytics/stats")
def get_stats():
    """Get aggregate prediction statistics: totals, rates, top countries, daily counts."""
    stats = get_prediction_stats()
    return stats


@router.get("/analytics/heatmap-data")
def get_heatmap():
    """Get latitude/longitude points for heatmap visualization on the dashboard map."""
    points = get_heatmap_data()
    return {"total_points": len(points), "points": points}