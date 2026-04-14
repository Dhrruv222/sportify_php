const test = require('node:test');
const assert = require('node:assert/strict');

const { computeScoutScoreFromAI } = require('./ai.service');

test('computeScoutScoreFromAI falls back when AI service is unavailable', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('network down');
  };

  try {
    const result = await computeScoutScoreFromAI({
      playerId: 'player_1',
      statsObj: { pace: 88, technical: 76, physical: 80, mental: 72 },
    });

    assert.equal(result.source, 'fallback');
    assert.equal(typeof result.score, 'number');
    assert.equal(result.breakdown.pace, 88);
  } finally {
    global.fetch = originalFetch;
  }
});

test('computeScoutScoreFromAI returns ai-service result when endpoint responds with valid payload', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      score: 82.7,
      breakdown: {
        pace: 81.1,
        technical: 79.6,
        physical: 85.2,
        mental: 84.9,
      },
    }),
  });

  try {
    const result = await computeScoutScoreFromAI({
      playerId: 'player_2',
      statsObj: { pace: 88, technical: 76, physical: 80, mental: 72 },
    });

    assert.equal(result.source, 'ai-service');
    assert.equal(result.score, 83);
    assert.deepEqual(result.breakdown, {
      pace: 81,
      technical: 80,
      physical: 85,
      mental: 85,
    });
  } finally {
    global.fetch = originalFetch;
  }
});
