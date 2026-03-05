function toScore(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function fallbackScore(stats = {}) {
  const pace = toScore(stats.pace ?? stats.speed ?? 70);
  const technical = toScore(stats.technical ?? stats.technique ?? 70);
  const physical = toScore(stats.physical ?? stats.strength ?? 70);
  const mental = toScore(stats.mental ?? stats.iq ?? 70);

  const score = Math.round((pace + technical + physical + mental) / 4);

  return {
    score,
    breakdown: {
      pace,
      technical,
      physical,
      mental,
    },
    source: 'fallback',
  };
}

async function computeScoutScoreFromAI({ playerId, statsObj }) {
  const endpoint = `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/internal/scout-score`;
  const headers = { 'Content-Type': 'application/json' };

  if (process.env.AI_INTERNAL_API_KEY) {
    headers['x-internal-api-key'] = process.env.AI_INTERNAL_API_KEY;
  }

  const payload = {
    playerId,
    stats: statsObj || {},
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI service HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data.score !== 'number' || typeof data.breakdown !== 'object') {
      throw new Error('AI service returned invalid payload');
    }

    return {
      score: toScore(data.score),
      breakdown: {
        pace: toScore(data.breakdown.pace),
        technical: toScore(data.breakdown.technical),
        physical: toScore(data.breakdown.physical),
        mental: toScore(data.breakdown.mental),
      },
      source: 'ai-service',
    };
  } catch {
    return fallbackScore(statsObj);
  }
}

module.exports = {
  computeScoutScoreFromAI,
};
