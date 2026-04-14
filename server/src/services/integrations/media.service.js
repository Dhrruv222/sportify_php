const crypto = require('node:crypto');

const DEFAULT_MOCK_UPLOAD_BASE_URL = 'http://mock-s3.local/upload';
const DEFAULT_UPLOAD_EXPIRES_SECONDS = 900;

function getMediaProvider() {
  return process.env.MEDIA_PROVIDER || 'mock';
}

function buildObjectKey(userId, fileType) {
  const extension = (fileType || 'application/octet-stream').split('/')[1] || 'bin';
  return `uploads/${userId}/${Date.now()}_${crypto.randomUUID()}.${extension}`;
}

async function getPresignedUploadUrl(userId, fileType) {
  if (!userId || !fileType) {
    throw new Error('userId and fileType are required');
  }

  const provider = getMediaProvider();
  if (provider !== 'mock') {
    throw new Error(`Unsupported MEDIA_PROVIDER: ${provider}. Use mock until post-MVP AWS rollout.`);
  }

  const objectKey = buildObjectKey(userId, fileType);
  const baseUrl = process.env.MEDIA_MOCK_BASE_URL || DEFAULT_MOCK_UPLOAD_BASE_URL;

  return {
    provider,
    url: `${baseUrl}/${encodeURIComponent(objectKey)}`,
    objectKey,
    expiresInSeconds: DEFAULT_UPLOAD_EXPIRES_SECONDS,
  };
}

module.exports = {
  getPresignedUploadUrl,
};
