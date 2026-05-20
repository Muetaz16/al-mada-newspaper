import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general'; // e.g. 'news', 'videos'

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف للرفع' }, { status: 400 });
    }

    // Check size limit (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize and generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;

    // Target upload directory
    // If MEDIA_UPLOAD_DIR env variable is configured (for production VPS Nginx serving), use it.
    // Otherwise, default to local Next.js public/uploads folder.
    const customUploadDir = process.env.MEDIA_UPLOAD_DIR;
    let uploadDir: string;
    
    if (customUploadDir) {
      uploadDir = path.join(customUploadDir, folder);
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    }

    // Create directories if they don't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    // The public relative URL returned
    const publicUrl = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Local upload error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء رفع الملف' }, { status: 500 });
  }
}
