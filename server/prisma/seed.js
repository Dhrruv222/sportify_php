const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in server/.env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Sportify123!", 10);

  const users = [
    { email: "player.test@sportify.dev", role: UserRole.PLAYER },
    { email: "club.test@sportify.dev", role: UserRole.CLUB },
    { email: "scout.test@sportify.dev", role: UserRole.SCOUT },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, password: passwordHash, gdprConsent: true },
      create: {
        email: user.email,
        password: passwordHash,
        role: user.role,
        gdprConsent: true,
      },
    });
  }

  const fitpassPlans = [
    {
      code: "bronze",
      name: "Bronze",
      description: "Starter fitness access",
      priceCents: 1499,
      currency: "EUR",
      durationDays: 30,
      features: ["1 gym access", "basic support"],
      isActive: true,
    },
    {
      code: "silver",
      name: "Silver",
      description: "Extended fitness package",
      priceCents: 2499,
      currency: "EUR",
      durationDays: 30,
      features: ["3 gym access", "priority support"],
      isActive: true,
    },
    {
      code: "gold",
      name: "Gold",
      description: "Full athlete package",
      priceCents: 3999,
      currency: "EUR",
      durationDays: 30,
      features: ["all partner gyms", "coach add-ons", "priority support"],
      isActive: true,
    },
    {
      code: "club_plus",
      name: "Club+",
      description: "Multi-user company/club plan",
      priceCents: 8999,
      currency: "EUR",
      durationDays: 30,
      features: ["multi-seat", "usage analytics", "employee assignment"],
      isActive: true,
    },
    {
      code: "digital",
      name: "Digital",
      description: "Remote-only training plan",
      priceCents: 999,
      currency: "EUR",
      durationDays: 30,
      features: ["digital workouts", "nutrition content"],
      isActive: true,
    },
  ];

  for (const plan of fitpassPlans) {
    await prisma.fitpassPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        currency: plan.currency,
        durationDays: plan.durationDays,
        features: plan.features,
        isActive: plan.isActive,
      },
      create: plan,
    });
  }

  console.log("✅ Seeded users: player, club, scout");
  console.log("✅ Seeded FIT-Pass plans: bronze, silver, gold, club_plus, digital");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
