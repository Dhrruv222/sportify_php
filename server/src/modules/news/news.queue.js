const { URL } = require('node:url');
const { Queue, Worker } = require('bullmq');
const { ingestNews } = require('./news.service');

const DEFAULT_QUEUE_NAME = 'news-ingestion';

let queueInstance;
let workerInstance;

function getQueueName() {
  return process.env.NEWS_QUEUE_NAME || DEFAULT_QUEUE_NAME;
}

function isQueueEnabled() {
  return Boolean(process.env.REDIS_URL);
}

function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }

  const parsed = new URL(redisUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

function getQueue() {
  if (!queueInstance) {
    queueInstance = new Queue(getQueueName(), {
      connection: getRedisConnection(),
    });
  }

  return queueInstance;
}

async function enqueueNewsIngestion(payload) {
  if (!isQueueEnabled()) {
    return {
      queued: false,
      mode: 'inline',
      accepted: true,
      reason: 'REDIS_URL is not configured',
    };
  }

  const queue = getQueue();
  const job = await queue.add('news:ingest', payload, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  return {
    queued: true,
    mode: 'bullmq',
    jobId: String(job.id),
  };
}

async function getNewsQueueStatus() {
  if (!isQueueEnabled()) {
    return {
      enabled: false,
      mode: 'inline',
      queueName: getQueueName(),
      reason: 'REDIS_URL is not configured',
    };
  }

  const queue = getQueue();
  const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');

  return {
    enabled: true,
    mode: 'bullmq',
    queueName: getQueueName(),
    counts,
  };
}

async function retryFailedNewsJobs({ limit = 20 } = {}) {
  if (!isQueueEnabled()) {
    return {
      enabled: false,
      mode: 'inline',
      requested: limit,
      retried: 0,
      reason: 'REDIS_URL is not configured',
    };
  }

  const queue = getQueue();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const failedJobs = await queue.getJobs(['failed'], 0, safeLimit - 1, false);
  let retried = 0;
  let retryFailed = 0;

  for (const job of failedJobs) {
    try {
      await job.retry();
      retried += 1;
    } catch {
      retryFailed += 1;
    }
  }

  return {
    enabled: true,
    mode: 'bullmq',
    requested: safeLimit,
    inspected: failedJobs.length,
    retried,
    retryFailed,
  };
}

function startNewsIngestionWorker() {
  if (!isQueueEnabled() || workerInstance) {
    return;
  }

  workerInstance = new Worker(
    getQueueName(),
    async (job) => ingestNews(job.data),
    { connection: getRedisConnection() },
  );

  workerInstance.on('failed', (job, error) => {
    console.error('[news-worker] job failed', {
      jobId: job?.id,
      name: job?.name,
      error: error?.message,
    });
  });
}

module.exports = {
  enqueueNewsIngestion,
  getNewsQueueStatus,
  retryFailedNewsJobs,
  startNewsIngestionWorker,
};