const { prisma } = require('../../lib/prisma');
const { sendEmail } = require('../../services/integrations');

function getPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
}

async function getCompanyByOwnerUserId(ownerUserId) {
  const company = await prisma.company.findUnique({
    where: { userId: ownerUserId },
  });

  if (!company) {
    throw new Error('Company not found for current user');
  }

  return company;
}

async function listEmployees({ ownerUserId, page, limit }) {
  const company = await getCompanyByOwnerUserId(ownerUserId);
  const normalizedPage = Number.isInteger(page) ? page : Number(page) || 1;
  const normalizedLimit = Number.isInteger(limit) ? limit : Number(limit) || 20;
  const skip = (normalizedPage - 1) * normalizedLimit;

  const [rows, total] = await Promise.all([
    prisma.companyEmployee.findMany({
      where: { companyId: company.id },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
        plan: {
          select: { id: true, code: true, name: true, priceCents: true, currency: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: normalizedLimit,
    }),
    prisma.companyEmployee.count({ where: { companyId: company.id } }),
  ]);

  return {
    items: rows,
    pagination: { page: normalizedPage, limit: normalizedLimit, total },
  };
}

async function addEmployee({ ownerUserId, email, planCode }) {
  const company = await getCompanyByOwnerUserId(ownerUserId);

  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.fitpassPlan.findUnique({ where: { code: planCode } }),
  ]);

  if (!user) {
    throw new Error('User with this email does not exist');
  }

  if (!plan || !plan.isActive) {
    throw new Error('Plan not found or inactive');
  }

  const membership = await prisma.companyEmployee.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: user.id,
      },
    },
    update: {
      planId: plan.id,
    },
    create: {
      companyId: company.id,
      userId: user.id,
      planId: plan.id,
    },
    include: {
      user: { select: { id: true, email: true, role: true } },
      plan: { select: { id: true, code: true, name: true } },
    },
  });

  await sendEmail(user.email, 'company_invite', {
    companyName: company.name,
    planName: plan.name,
  });

  return membership;
}

async function removeEmployee({ ownerUserId, employeeId }) {
  const company = await getCompanyByOwnerUserId(ownerUserId);

  const deleted = await prisma.companyEmployee.deleteMany({
    where: {
      id: employeeId,
      companyId: company.id,
    },
  });

  if (deleted.count === 0) {
    throw new Error('Employee membership not found');
  }

  return { removed: true };
}

async function getStats({ ownerUserId }) {
  const company = await getCompanyByOwnerUserId(ownerUserId);
  const periodStart = getPeriodStart();

  const employees = await prisma.companyEmployee.findMany({
    where: { companyId: company.id },
    select: { userId: true },
  });

  const userIds = employees.map((e) => e.userId);

  const [totalEmployees, activeSubscriptions, periodCheckins] = await Promise.all([
    prisma.companyEmployee.count({ where: { companyId: company.id } }),
    prisma.fitpassSubscription.count({
      where: {
        userId: { in: userIds.length ? userIds : ['__none__'] },
        status: 'active',
        validTo: { gte: new Date() },
      },
    }),
    prisma.fitpassCheckin.count({
      where: {
        checkedInAt: { gte: periodStart },
        subscription: {
          userId: { in: userIds.length ? userIds : ['__none__'] },
        },
      },
    }),
  ]);

  return {
    totalEmployees,
    activeSubscriptions,
    periodCheckins,
    periodStart,
  };
}

module.exports = {
  listEmployees,
  addEmployee,
  removeEmployee,
  getStats,
};
