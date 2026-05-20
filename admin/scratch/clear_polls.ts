import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up broken polls...');
  await prisma.pollOption.deleteMany({});
  await prisma.poll.deleteMany({});
  console.log('Done! All polls cleared.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
