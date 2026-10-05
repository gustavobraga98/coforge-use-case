from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel_case(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel_case, populate_by_name=True)


class ChatRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(ApiModel):
    role: ChatRole
    content: str = Field(min_length=1, max_length=2_000)


class TripBudget(ApiModel):
    amount: int | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)


class TripConstraints(ApiModel):
    origin: str | None = Field(default=None, max_length=100)
    destination: str | None = Field(default=None, max_length=100)
    departure_date: date | None = None
    return_date: date | None = None
    arrive_before: datetime | None = None
    direct_flights_preferred: bool | None = None
    budget: TripBudget | None = None

    @field_validator("arrive_before")
    @classmethod
    def require_arrival_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            raise ValueError("Arrival deadlines must include a timezone.")
        return value


MissingField = Literal[
    "origin",
    "destination",
    "departureDate",
    "returnDate",
    "arrivalDeadline",
    "directFlightPreference",
    "budget",
]


class InterpretationStatus(StrEnum):
    COMPLETE = "complete"
    NEEDS_CLARIFICATION = "needs_clarification"


class GeocodingStatus(StrEnum):
    RESOLVED = "resolved"
    NOT_FOUND = "not_found"
    AMBIGUOUS = "ambiguous"


class GeocodedLocation(ApiModel):
    query: str
    status: GeocodingStatus
    label: str | None = None
    country: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    time_zone: str | None = None


class GeocodeRequest(ApiModel):
    query: str = Field(min_length=2, max_length=160)


class MapConfiguration(ApiModel):
    style_url: str | None = None
    available: bool

class AssistantTurn(ApiModel):
    interpretation: "InterpretResponse"
    origin: GeocodedLocation | None = None
    destination: GeocodedLocation | None = None


class InterpretRequest(ApiModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class InterpretResponse(ApiModel):
    constraints: TripConstraints
    status: InterpretationStatus
    missing_fields: list[MissingField]
