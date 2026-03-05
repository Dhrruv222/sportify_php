const {
  getPresignedUploadUrl: getUploadUrlFromMedia,
  sendEmail: sendEmailFromProvider,
  computeScoutScoreFromAI,
} = require('./integrations');

async function getPresignedUploadUrl(userId, fileType) {
  return getUploadUrlFromMedia(userId, fileType);
}

async function sendEmail(to, template, vars) {
  await sendEmailFromProvider(to, template, vars);
}

async function getUserSubscription(userId) {
  void userId;

  return {
    plan: 'gold',
    status: 'active',
    qrUrl: '',
    validTo: undefined,
  };
}

async function generateQRCode(subscriptionId) {
  void subscriptionId;

  return {
    qrImageUrl: 'http://mock/qr.png',
  };
}

async function computeScoutScore(playerId, statsObj) {
  const result = await computeScoutScoreFromAI({ playerId, statsObj });

  return {
    score: result.score,
    breakdown: {
      pace: result.breakdown.pace,
      technical: result.breakdown.technical,
      physical: result.breakdown.physical,
      mental: result.breakdown.mental,
    },
  };
}

async function getArticles(params) {
  const locale = params?.locale || 'en';

  return [
    {
      id: 1,
      title: 'Mock news',
      locale,
    },
  ];
}

module.exports = {
  getPresignedUploadUrl,
  sendEmail,
  getUserSubscription,
  generateQRCode,
  computeScoutScore,
  getArticles,
};
