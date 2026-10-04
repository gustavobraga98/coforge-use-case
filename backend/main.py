from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, status

from .assistant import LocalModelError, TravelInterpreter
from .schemas import ChatMessage, InterpretRequest, InterpretResponse


logger = logging.getLogger(__name__)
Interpreter = Callable[[list[ChatMessage]], Awaitable[InterpretResponse]]


def create_app(interpreter: Interpreter | None = None) -> FastAPI:
    app = FastAPI(title="Atlas Travel Assistant", version="0.1.0")
    interpret = interpreter or TravelInterpreter().interpret

    @app.post("/api/assistant/interpret", response_model=InterpretResponse)
    async def interpret_trip_request(payload: InterpretRequest) -> InterpretResponse:
        try:
            return await interpret(payload.messages)
        except LocalModelError as error:
            cause = error.__cause__
            logger.error(
                "Local model interpretation failed (%s): %s",
                type(cause).__name__ if cause is not None else "unknown error",
                cause,
                exc_info=error,
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "local_model_unavailable",
                    "message": "The local LM Studio model is unavailable. Start the server, load the model, and try again.",
                },
            ) from error

    return app


app = create_app()
