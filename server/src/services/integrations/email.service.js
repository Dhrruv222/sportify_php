function getEmailProvider() {
  return process.env.EMAIL_PROVIDER || 'mock';
}

function validatePayload(to, template) {
  if (!to) {
    throw new Error('sendEmail requires "to"');
  }

  if (!template) {
    throw new Error('sendEmail requires "template"');
  }
}

async function sendEmail(to, template, vars = {}) {
  validatePayload(to, template);

  const provider = getEmailProvider();
  if (provider !== 'mock') {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}. Use mock until post-MVP AWS rollout.`);
  }

  const messageId = `mock_${Date.now()}`;
  console.log('[sendEmail:mock]', { to, template, vars, messageId });

  return {
    provider,
    accepted: true,
    messageId,
  };
}

module.exports = {
  sendEmail,
};
