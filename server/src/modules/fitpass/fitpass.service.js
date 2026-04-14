const crypto = require('node:crypto');
const { prisma } = require('../../lib/prisma');

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function listPlans({ active = true } = {}) {
  return prisma.fitpassPlan.findMany({
    where: { isActive: active },
    orderBy: [{ priceCents: 'asc' }],
  });
}

async function subscribe({ userId, planCode }) {
  const plan = await prisma.fitpassPlan.findUnique({ where: { code: planCode } });
  if (!plan || !plan.isActive) {
    throw new Error('Plan not found or inactive');
  }

  const now = new Date();
  const qrValue = `fitpass_${crypto.randomUUID()}`;
  const validTo = addDays(now, plan.durationDays);
  const qrImageUrl = `http://mock-qr.local/${encodeURIComponent(qrValue)}.png`;

  const subscription = await prisma.fitpassSubscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'active',
      qrValue,
      qrImageUrl,
      validFrom: now,
      validTo,
    },
  });

  return { subscription, plan };
}

async function getMyQr({ userId }) {
  const subscription = await prisma.fitpassSubscription.findFirst({
    where: {
      userId,
      status: 'active',
      validTo: { gte: new Date() },
    },
    orderBy: [{ validTo: 'desc' }],
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  return {
    qrImageUrl: subscription.qrImageUrl,
    qrValue: subscription.qrValue,
    validTo: subscription.validTo,
  };
}

async function checkin({ qrValue, partnerId }) {
  const subscription = await prisma.fitpassSubscription.findFirst({
    where: {
      qrValue,
      status: 'active',
      validTo: { gte: new Date() },
    },
  });

  if (!subscription) {
    throw new Error('Invalid or expired QR code');
  }

  const checkin = await prisma.fitpassCheckin.create({
    data: {
      subscriptionId: subscription.id,
      partnerId,
    },
  });

  return {
    checkinId: checkin.id,
    checkedInAt: checkin.checkedInAt,
    partnerId: checkin.partnerId,
  };
}

module.exports = {
  listPlans,
  subscribe,
  getMyQr,
  checkin,
};
