from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request, status
from pydantic_ai.ui.ag_ui import AGUIAdapter
from pydantic_ai.ui import StateDeps

from .assistant import CodexModelError, TravelInterpreter, build_conversational_agent
from .geography import GeoapifyError, GeoapifyGeocoder, Geocoder, geoapify_map_style
from .schemas import AssistantTurn, ChatMessage, GeocodeRequest, GeocodedLocation, InterpretRequest, InterpretResponse, MapConfiguration


logger = logging.getLogger(__name__)
Interpreter = Callable[[list[ChatMessage]], Awaitable[InterpretResponse]]


def create_app(interpreter: Interpreter | None = None, geocoder: Geocoder | None = None) -> FastAPI:
    app = FastAPI(title="Atlas Travel Assistant", version="0.1.0")
    interpret = interpreter or TravelInterpreter().interpret
    conversational_agent = build_conversational_agent()
    resolve_location = geocoder or GeoapifyGeocoder()

    @app.get("/api/map/config", response_model=MapConfiguration)
    async def map_config() -> MapConfiguration:
        style_url = geoapify_map_style()
        return MapConfiguration(style_url=style_url, available=style_url is not None)

    @app.post("/api/locations/geocode", response_model=GeocodedLocation)
    async def geocode_location(payload: GeocodeRequest) -> GeocodedLocation:
        try:
            return await resolve_location.geocode_location(payload.query)
        except GeoapifyError as error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "geocoding_unavailable", "message": "Location lookup is unavailable. Continue planning with simulated options."},
            ) from error

    @app.post("/api/assistant/interpret", response_model=InterpretResponse)
    async def interpret_trip_request(payload: InterpretRequest) -> InterpretResponse:
        try:
            return await interpret(payload.messages)
        except CodexModelError as error:
            cause = error.__cause__
            logger.error(
                "Codex model interpretation failed (%s): %s",
                type(cause).__name__ if cause is not None else "unknown error",
                cause,
                exc_info=error,
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "codex_model_unavailable",
                    "message": "The Codex model is unavailable. Run `codex login` and try again.",
                },
            ) from error

    @app.post("/api/assistant/chat", response_model=AssistantTurn)
    async def assistant_chat(payload: InterpretRequest) -> AssistantTurn:
        interpretation = await interpret_trip_request(payload)
        constraints = interpretation.constraints
        async def resolve(query: str | None) -> GeocodedLocation | None:
            if not query:
                return None
            try:
                return await resolve_location.geocode_location(query)
            except GeoapifyError:
                return None
        origin, destination = await resolve(constraints.origin), await resolve(constraints.destination)
        return AssistantTurn(interpretation=interpretation, origin=origin, destination=destination)

    @app.post("/api/assistant/ag-ui")
    async def assistant_ag_ui(request: Request):
        """Stream the PydanticAI Codex assistant using the AG-UI protocol."""
        try:
            payload = await request.json()
            plan_state = payload.get('state', {})
            if not isinstance(plan_state, dict):
                raise ValueError('The shared plan state must be an object.')
            return await AGUIAdapter.dispatch_request(request, agent=conversational_agent, deps=StateDeps(plan_state))
        except Exception as error:
            logger.error("AG-UI assistant failed", exc_info=error)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "codex_model_unavailable", "message": "The Codex AG-UI assistant is unavailable. Run `codex login` and try again."},
            ) from error

    return app


app = create_app()
