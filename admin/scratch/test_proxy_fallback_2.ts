import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.category.findFirst();
    if (!category) {
      console.log("No categories found in DB!");
      return;
    }

    const payload = {
      id: "f8d8f8d8-f8d8-f8d8-f8d8-f8d8f8d8f8d8",
      title: "Test News Title",
      subtitle: "Test Subtitle",
      slug: "test-news-title",
      category_id: category.id,
      status: "DRAFT",
      is_breaking: false,
      image_url: "https://example.com/image.jpg",
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }]
      },
      author_id: "29e9c085-ae46-4da3-a143-300855a28b89", // Motaz's user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Attempting to insert with valid user ID and valid category ID...");
    await prisma.news.create({ data: payload as any });
    console.log("Insert successful! Validation logic is perfect.");
    await prisma.news.delete({ where: { id: payload.id } }); // cleanup
  } catch (error: any) {
    console.error("Prisma error name:", error.name);
    console.error("Prisma error message:", error.message);
  }
}

main().finally(() => prisma.$disconnect());
