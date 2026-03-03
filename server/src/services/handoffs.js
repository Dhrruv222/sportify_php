const { getPresignedUploadUrl: getUploadUrlFromMedia, sendEmail: sendEmailFromProvider } = require('./integrations');

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
  void playerId;
  void statsObj;

  return {
    score: 75,
    breakdown: {
      pace: 80,
      tech: 70,
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
