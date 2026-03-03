const { getPresignedUploadUrl } = require('./media.service');
const { sendEmail } = require('./email.service');

module.exports = {
  getPresignedUploadUrl,
  sendEmail,
};
