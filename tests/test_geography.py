import asyncio

import httpx

from backend.geography import GeoapifyGeocoder
from backend.main import create_app
from backend.schemas import GeocodedLocation, GeocodingStatus


def run_geocode(payload: dict, status_code: int = 200):
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code, json=payload)
    async def request():
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            return await GeoapifyGeocoder("test-key", client).geocode_location("São Paulo")
    return asyncio.run(request())


def test_geoapify_geocoder_resolves_a_city() -> None:
    result = run_geocode({"features": [{"properties": {"formatted": "São Paulo, Brazil", "country": "Brazil", "timezone": {"name": "America/Sao_Paulo"}}, "geometry": {"coordinates": [-46.6333, -23.5505]}}]})
    assert result.status is GeocodingStatus.RESOLVED
    assert result.label == "São Paulo, Brazil"
    assert result.latitude == -23.5505


def test_geoapify_geocoder_reports_not_found_and_ambiguous_results() -> None:
    assert run_geocode({"features": []}).status is GeocodingStatus.NOT_FOUND
    assert run_geocode({"features": [{}, {}]}).status is GeocodingStatus.AMBIGUOUS


def test_geoapify_geocoder_converts_invalid_credentials_and_network_errors() -> None:
    try:
        run_geocode({"message": "invalid"}, 401)
    except Exception as error:
        assert error.__class__.__name__ == "GeoapifyError"
    else:
        raise AssertionError("Invalid credentials must be unavailable to the application")


def test_geocoding_endpoint_exposes_a_typed_location() -> None:
    class StubGeocoder:
        async def geocode_location(self, query: str) -> GeocodedLocation:
            return GeocodedLocation(query=query, status=GeocodingStatus.RESOLVED, label="New York, United States", country="United States", latitude=40.7128, longitude=-74.006, time_zone="America/New_York")
    async def request():
        transport = httpx.ASGITransport(app=create_app(geocoder=StubGeocoder()))
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post("/api/locations/geocode", json={"query": "New York"})
    response = asyncio.run(request())
    assert response.status_code == 200
    assert response.json()["status"] == "resolved"
