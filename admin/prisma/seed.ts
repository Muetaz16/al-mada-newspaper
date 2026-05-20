const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Hash default admin password: admin@almada
  const passwordHash = await bcrypt.hash('admin@almada', 10);

  // 1. Create a default Author with Al-Mada branding and password
  const author = await prisma.user.upsert({
    where: { email: 'admin@almada.com' },
    update: {
      password_hash: passwordHash,
    },
    create: {
      email: 'admin@almada.com',
      name: 'رئيس التحرير',
      role: 'SUPER_ADMIN',
      password_hash: passwordHash,
    },
  });

  console.log(`Default admin created: admin@almada.com / admin@almada`);

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
