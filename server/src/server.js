const app = require('./app');
const { startNewsIngestionWorker } = require('./modules/news/news.queue');
const { startAutoNewsIngestionScheduler } = require('./modules/news/news.scheduler');

const PORT = process.env.PORT || 3000;

startNewsIngestionWorker();
startAutoNewsIngestionScheduler();

app.listen(PORT, () => {
  console.log(`Running in port ${PORT}`);
});
