import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


client = TestClient(main.app)


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_internal_scout_score_fallback_shape(monkeypatch) -> None:
    monkeypatch.delenv("INTERNAL_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("AI_FALLBACK_ENABLED", "true")

    response = client.post(
        "/internal/scout-score",
        json={
            "playerId": "player_1",
            "stats": {"pace": 90, "technical": 77, "physical": 81, "mental": 75},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["score"] == 81
    assert payload["breakdown"] == {
        "pace": 90,
        "technical": 77,
        "physical": 81,
        "mental": 75,
    }


def test_internal_scout_score_requires_internal_key_when_configured(monkeypatch) -> None:
    monkeypatch.setenv("INTERNAL_API_KEY", "secret_key")
    monkeypatch.setenv("AI_FALLBACK_ENABLED", "true")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    unauthorized = client.post(
        "/internal/scout-score",
        json={"playerId": "player_2", "stats": {"pace": 70}},
    )
    assert unauthorized.status_code == 401

    authorized = client.post(
        "/internal/scout-score",
        headers={"x-internal-api-key": "secret_key"},
        json={"playerId": "player_2", "stats": {"pace": 70}},
    )
    assert authorized.status_code == 200


def test_internal_scout_score_returns_502_when_fallback_disabled(monkeypatch) -> None:
    monkeypatch.delenv("INTERNAL_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("AI_FALLBACK_ENABLED", "false")

    response = client.post(
        "/internal/scout-score",
        json={"playerId": "player_3", "stats": {"pace": 65}},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "AI scoring unavailable"