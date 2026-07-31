const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateReferralCode(seed) {
  const clean = String(seed).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "BBRICK";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
  }
  return `${clean}-${suffix}`;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { referralCode: null },
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const user of users) {
    let code = generateReferralCode(user.name || "BBRICK");
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await prisma.user.findUnique({
        where: { referralCode: code },
        select: { id: true },
      });
      if (!taken) break;
      code = generateReferralCode(`${user.name || "BBRICK"}${attempt}`);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: code },
    });
    updated++;
  }

  console.log(`Backfilled referral codes for ${updated} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
