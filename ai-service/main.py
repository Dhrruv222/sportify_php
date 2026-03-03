from typing import Dict, Any

import os
from fastapi import FastAPI, Header, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

app = FastAPI(title="Sportify AI Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


class ScoutScoreRequest(BaseModel):
    playerId: str = Field(min_length=1)
    stats: Dict[str, Any] = Field(default_factory=dict)


class ScoutScoreResponse(BaseModel):
    score: int
    breakdown: Dict[str, int]


def clamp_score(value: Any, default: int = 70) -> int:
    try:
        numeric = int(round(float(value)))
    except (TypeError, ValueError):
        numeric = default
    return max(0, min(100, numeric))


def fallback_scout_score(stats: Dict[str, Any]) -> ScoutScoreResponse:
    pace = clamp_score(stats.get("pace") or stats.get("speed"), 70)
    technical = clamp_score(stats.get("technical") or stats.get("technique"), 70)
    physical = clamp_score(stats.get("physical") or stats.get("strength"), 70)
    mental = clamp_score(stats.get("mental") or stats.get("iq"), 70)
    score = round((pace + technical + physical + mental) / 4)

    return ScoutScoreResponse(
        score=score,
        breakdown={
            "pace": pace,
            "technical": technical,
            "physical": physical,
            "mental": mental,
        },
    )


def parse_ai_json(raw_text: str) -> ScoutScoreResponse:
    import json

    parsed = json.loads(raw_text)
    breakdown = parsed.get("breakdown") or {}

    return ScoutScoreResponse(
        score=clamp_score(parsed.get("score"), 70),
        breakdown={
            "pace": clamp_score(breakdown.get("pace"), 70),
            "technical": clamp_score(breakdown.get("technical"), 70),
            "physical": clamp_score(breakdown.get("physical"), 70),
            "mental": clamp_score(breakdown.get("mental"), 70),
        },
    )


def compute_scout_score_with_openai(stats: Dict[str, Any]) -> ScoutScoreResponse:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    timeout_ms = int(os.getenv("OPENAI_TIMEOUT_MS", "30000"))
    client = OpenAI(api_key=api_key, timeout=timeout_ms / 1000)

    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "system",
                "content": (
                    "You are a football scout scoring assistant. "
                    "Return only valid JSON with this exact shape: "
                    '{"score": number, "breakdown": {"pace": number, "technical": number, "physical": number, "mental": number}}. '
                    "All numbers must be integers from 0 to 100."
                ),
            },
            {
                "role": "user",
                "content": f"Player stats JSON: {stats}",
            },
        ],
    )

    raw_text = response.output_text
    if not raw_text:
        raise RuntimeError("OpenAI returned empty output")

    return parse_ai_json(raw_text)


@app.post("/internal/scout-score", response_model=ScoutScoreResponse)
def internal_scout_score(
    payload: ScoutScoreRequest,
    x_internal_api_key: str | None = Header(default=None),
) -> ScoutScoreResponse:
    required_key = os.getenv("INTERNAL_API_KEY")
    if required_key and x_internal_api_key != required_key:
        raise HTTPException(status_code=401, detail="Invalid internal API key")

    fallback_enabled = os.getenv("AI_FALLBACK_ENABLED", "true").lower() == "true"

    try:
        return compute_scout_score_with_openai(payload.stats)
    except Exception:
        if fallback_enabled:
            return fallback_scout_score(payload.stats)
        raise HTTPException(status_code=502, detail="AI scoring unavailable")
