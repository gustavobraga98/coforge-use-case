import asyncio
from datetime import date, datetime
from types import SimpleNamespace

import httpx
import pytest
from pydantic_ai import PromptedOutput, UnexpectedModelBehavior
from pydantic_ai.models.openai_codex import OpenAICodexModel

from backend.assistant import (
    CODEX_MODEL_TIMEOUT_SECONDS,
    CodexModelError,
    TravelInterpreter,
    apply_arrival_time_fallback,
    create_interpretation,
)
from backend.main import create_app
from backend.schemas import ChatMessage, InterpretationStatus, TripBudget, TripConstraints


def canonical_constraints() -> TripConstraints:
    return TripConstraints(
        origin="São Paulo",
        destination="New York",
        departure_date=date(2026, 11, 12),
        return_date=date(2026, 11, 16),
        arrive_before=datetime.fromisoformat("2026-11-12T15:00:00-05:00"),
        direct_flights_preferred=True,
        budget=TripBudget(amount=3000, currency="USD"),
    )


def test_complete_interpretation_has_no_missing_fields() -> None:
    interpretation = create_interpretation(canonical_constraints())

    assert interpretation.status is InterpretationStatus.COMPLETE
    assert interpretation.missing_fields == []


def test_partial_interpretation_requests_the_missing_details() -> None:
    interpretation = create_interpretation(TripConstraints(destination="New York"))

    assert interpretation.status is InterpretationStatus.NEEDS_CLARIFICATION
    assert interpretation.missing_fields == [
        "origin",
        "departureDate",
        "returnDate",
        "arrivalDeadline",
        "directFlightPreference",
        "budget",
    ]


@pytest.mark.parametrize("message", ["before 6pm", "antes das 18:00"])
def test_arrival_time_fallback_keeps_explicit_english_and_portuguese_times(message: str) -> None:
    constraints = TripConstraints(departure_date=date(2026, 4, 10))
    resolved = apply_arrival_time_fallback(constraints, [ChatMessage(role="user", content=message)])
    assert resolved.arrive_before == datetime.fromisoformat("2026-04-10T18:00:00+00:00")


def test_endpoint_returns_a_typed_interpretation() -> None:
    async def interpret(_: list[ChatMessage]):
        return create_interpretation(canonical_constraints())

    async def post_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=create_app(interpret))
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/api/assistant/interpret",
                json={"messages": [{"role": "user", "content": "Plan a fictional trip."}]},
            )

    response = asyncio.run(post_request())

    assert response.status_code == 200
    assert response.json()["status"] == "complete"
    assert response.json()["constraints"]["directFlightsPreferred"] is True
    assert response.json()["constraints"]["budget"] == {"amount": 3000, "currency": "USD"}


def test_endpoint_reports_a_codex_model_failure() -> None:
    async def interpret(_: list[ChatMessage]):
        raise CodexModelError("offline")

    async def post_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=create_app(interpret))
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/api/assistant/interpret",
                json={"messages": [{"role": "user", "content": "Plan a fictional trip."}]},
            )

    response = asyncio.run(post_request())

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "codex_model_unavailable"


def test_interpreter_uses_codex_prompted_output_with_a_ninety_second_timeout() -> None:
    interpreter = TravelInterpreter()

    assert isinstance(interpreter._agent.output_type, PromptedOutput)
    assert interpreter._agent.output_type.outputs is TripConstraints
    assert isinstance(interpreter._agent.model, OpenAICodexModel)
    assert interpreter._agent.model.model_name == "gpt-6-luna"
    assert CODEX_MODEL_TIMEOUT_SECONDS == 90


def test_conversational_agent_uses_luna_without_reasoning_for_tool_calls() -> None:
    from backend.assistant import build_conversational_agent

    agent = build_conversational_agent()

    assert isinstance(agent.model, OpenAICodexModel)
    assert agent.model.model_name == "gpt-6-luna"
    assert agent.model_settings["openai_reasoning_effort"] == "none"


@pytest.mark.parametrize(
    "failure",
    [httpx.ReadTimeout("local inference timed out"), UnexpectedModelBehavior("invalid JSON output")],
)
def test_interpreter_converts_inference_and_invalid_json_failures_to_codex_model_errors(
    failure: Exception,
) -> None:
    class FailingAgent:
        async def run(self, _: str) -> SimpleNamespace:
            raise failure

    interpreter = TravelInterpreter()
    interpreter._agent = FailingAgent()  # type: ignore[assignment]

    with pytest.raises(CodexModelError, match="could not interpret") as error:
        asyncio.run(interpreter.interpret([ChatMessage(role="user", content="Plan a fictional trip.")]))

    assert error.value.__cause__ is failure
