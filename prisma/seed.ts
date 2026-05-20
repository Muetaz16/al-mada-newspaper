const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create a default Author
  const author = await prisma.user.upsert({
    where: { email: 'admin@injaz.com' },
    update: {},
    create: {
      email: 'admin@injaz.com',
      name: 'رئيس التحرير',
      role: 'SUPER_ADMIN',
    },
  });

  // 2. Create Categories
  const categories = [
    { name_ar: 'سياسة', slug: 'politics' },
    { name_ar: 'اقتصاد', slug: 'economy' },
    { name_ar: 'رياضة', slug: 'sports' },
    { name_ar: 'تكنولوجيا', slug: 'tech' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const techCat = await prisma.category.findUnique({ where: { slug: 'tech' } });

  // 3. Create initial News
  await prisma.news.upsert({
    where: { slug: 'future-of-ai-arabic' },
    update: {},
    create: {
      title: 'مستقبل الذكاء الاصطناعي في المنطقة العربية',
      slug: 'future-of-ai-arabic',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'محتوى تجريبي للذكاء الاصطناعي...' }] }] },
      category_id: techCat.id,
      author_id: author.id,
      status: 'PUBLISHED',
      is_breaking: true,
      featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
