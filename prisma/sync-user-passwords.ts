import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.Database_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30000,
  statement_timeout: 30000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const accounts = await prisma.account.findMany({
    where: {
      providerId: "credential",
      password: {
        not: null,
      },
    },
    select: {
      userId: true,
      password: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const latestPasswordByUser = new Map<string, string>();

  for (const account of accounts) {
    if (!account.password) {
      continue;
    }

    if (!latestPasswordByUser.has(account.userId)) {
      latestPasswordByUser.set(account.userId, account.password);
    }
  }

  let updatedUsers = 0;

  for (const [userId, password] of latestPasswordByUser.entries()) {
    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        password: null,
      },
      data: {
        password,
      },
    });

    updatedUsers += result.count;
  }

  const remainingNullUsers = await prisma.user.count({
    where: {
      password: null,
    },
  });

  console.log(
    JSON.stringify(
      {
        credentialAccounts: latestPasswordByUser.size,
        updatedUsers,
        remainingNullUsers,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
