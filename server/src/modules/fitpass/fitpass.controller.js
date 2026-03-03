const fitpassService = require('./fitpass.service');

function getUserIdFromRequest(req) {
  return req.headers['x-user-id'];
}

async function getPlans(req, res) {
  try {
    const plans = await fitpassService.listPlans({ active: req.query.active });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function subscribe(req, res) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Missing x-user-id header' });
    }

    const result = await fitpassService.subscribe({ userId, planCode: req.body.planCode });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function getMyQr(req, res) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Missing x-user-id header' });
    }

    const result = await fitpassService.getMyQr({ userId });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
}

async function checkin(req, res) {
  try {
    const result = await fitpassService.checkin(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPlans,
  subscribe,
  getMyQr,
  checkin,
};
