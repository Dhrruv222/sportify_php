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
