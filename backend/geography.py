from __future__ import annotations

import os
from typing import Protocol

import httpx
from dotenv import load_dotenv

from .schemas import GeocodedLocation, GeocodingStatus


load_dotenv()


class GeoapifyError(RuntimeError):
    """Raised when Geoapify cannot be reached or rejects a request."""


class Geocoder(Protocol):
    async def geocode_location(self, query: str) -> GeocodedLocation: ...


class GeoapifyGeocoder:
    endpoint = "https://api.geoapify.com/v1/geocode/search"

    def __init__(self, api_key: str | None = None, client: httpx.AsyncClient | None = None) -> None:
        self.api_key = api_key if api_key is not None else os.getenv("GEOAPIFY_API_KEY", "")
        self.client = client

    async def geocode_location(self, query: str) -> GeocodedLocation:
        if not self.api_key:
            raise GeoapifyError("Geoapify is not configured.")

        owns_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=8)
        try:
            response = await client.get(self.endpoint, params={"text": query, "type": "city", "limit": 2, "apiKey": self.api_key})
            response.raise_for_status()
            features = response.json().get("features", [])
        except (httpx.HTTPError, ValueError) as error:
            raise GeoapifyError("Geoapify is unavailable.") from error
        finally:
            if owns_client:
                await client.aclose()

        if not features:
            return GeocodedLocation(query=query, status=GeocodingStatus.NOT_FOUND)
        if len(features) > 1:
            return GeocodedLocation(query=query, status=GeocodingStatus.AMBIGUOUS)

        properties = features[0].get("properties", {})
        coordinates = features[0].get("geometry", {}).get("coordinates", [])
        if len(coordinates) != 2:
            return GeocodedLocation(query=query, status=GeocodingStatus.NOT_FOUND)
        return GeocodedLocation(
            query=query,
            status=GeocodingStatus.RESOLVED,
            label=properties.get("formatted"),
            country=properties.get("country"),
            longitude=coordinates[0],
            latitude=coordinates[1],
            time_zone=properties.get("timezone", {}).get("name"),
        )


def geoapify_map_style() -> str | None:
    key = os.getenv("GEOAPIFY_API_KEY")
    return f"https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey={key}" if key else None
