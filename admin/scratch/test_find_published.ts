import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.news.findMany({
    where: {
      status: 'PUBLISHED'
    },
    include: {
      category: true
    }
  });
  console.log(`Found ${news.length} PUBLISHED news items.`);
  for (const item of news) {
    console.log(`- Title: ${item.title}`);
    console.log(`  Category: ${item.category?.name_ar} (slug: ${item.category?.slug})`);
  }
}

main().finally(() => prisma.$disconnect());
