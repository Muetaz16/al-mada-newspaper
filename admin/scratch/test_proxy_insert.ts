import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const payload = {
      id: "f8d8f8d8-f8d8-f8d8-f8d8-f8d8f8d8f8d8",
      title: "Test News Title",
      subtitle: "Test Subtitle",
      slug: "test-news-title",
      category_id: "fake-id",
      status: "DRAFT",
      is_breaking: false,
      image_url: "https://example.com/image.jpg",
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }]
      },
      author_id: "fake-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Attempting to insert...");
    await prisma.news.create({ data: payload as any });
    console.log("Insert successful!");
  } catch (error: any) {
    console.error("Prisma error name:", error.name);
    console.error("Prisma error message:", error.message);
  }
}

main().finally(() => prisma.$disconnect());
