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

  console.log("✅ Seeded users: player, club, scout");
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
