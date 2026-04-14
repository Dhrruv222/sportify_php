function parseEnabled(value) {
  return String(value || '').toLowerCase() === 'true';
}

async function defaultEnqueue(payload) {
  const { enqueueNewsIngestion } = require('./news.queue');
  return enqueueNewsIngestion(payload);
}

function parseLocales(raw) {
  const source = raw || 'en';
  const locales = source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return locales.length ? locales : ['en'];
}

function parseIntervalMs(raw) {
  const parsed = Number(raw || 900000);
  if (!Number.isFinite(parsed)) return 900000;
  return Math.max(60000, Math.floor(parsed));
}

async function runSchedulerTick({ locales, limit, enqueue = defaultEnqueue, logger = console }) {
  const results = [];

  for (const locale of locales) {
    const result = await enqueue({ locale, limit });
    results.push({ locale, ...result });
  }

  logger.log('[news-scheduler] tick completed', {
    locales,
    limit,
    processed: results.length,
  });

  return results;
}

function startAutoNewsIngestionScheduler({ enqueue = defaultEnqueue, logger = console } = {}) {
  const enabled = parseEnabled(process.env.NEWS_AUTO_INGEST_ENABLED);
  if (!enabled) {
    return { started: false };
  }

  const locales = parseLocales(process.env.NEWS_AUTO_INGEST_LOCALES);
  const limit = Math.max(1, Math.min(Number(process.env.NEWS_AUTO_INGEST_LIMIT || 5), 20));
  const intervalMs = parseIntervalMs(process.env.NEWS_AUTO_INGEST_INTERVAL_MS);

  const run = async () => {
    try {
      await runSchedulerTick({ locales, limit, enqueue, logger });
    } catch (error) {
      logger.error('[news-scheduler] tick failed', { error: error.message });
    }
  };

  if (parseEnabled(process.env.NEWS_AUTO_INGEST_RUN_ON_START)) {
    run();
  }

  const timer = globalThis.setInterval(run, intervalMs);

  return {
    started: true,
    intervalMs,
    locales,
    stop: () => globalThis.clearInterval(timer),
  };
}

module.exports = {
  parseLocales,
  parseIntervalMs,
  runSchedulerTick,
  startAutoNewsIngestionScheduler,
};