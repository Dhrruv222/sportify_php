const app = require('./app');
const { startNewsIngestionWorker } = require('./modules/news/news.queue');
const { startAutoNewsIngestionScheduler } = require('./modules/news/news.scheduler');
const { validateEnv } = require('./config/env');

const PORT = process.env.PORT || 3000;

const envStatus = validateEnv();
if (!envStatus.ok) {
  console.error('[env] Missing required configuration:', envStatus.errors);
  process.exit(1);
}

if (envStatus.warnings.length) {
  console.warn('[env] Configuration warnings:', envStatus.warnings);
}

startNewsIngestionWorker();
startAutoNewsIngestionScheduler();

app.listen(PORT, () => {
  console.log(`Running in port ${PORT}`);
});
