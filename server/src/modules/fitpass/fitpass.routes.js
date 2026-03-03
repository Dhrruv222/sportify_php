const express = require('express');

const { validateBody, validateQuery } = require('../../middlewares/validate');
const {
  subscribeSchema,
  checkinSchema,
  plansQuerySchema,
} = require('./fitpass.schema');
const {
  getPlans,
  subscribe,
  getMyQr,
  checkin,
} = require('./fitpass.controller');

const router = express.Router();

router.get('/plans', validateQuery(plansQuerySchema), getPlans);
router.post('/subscribe', validateBody(subscribeSchema), subscribe);
router.get('/me/qr', getMyQr);
router.post('/checkin', validateBody(checkinSchema), checkin);

module.exports = router;
