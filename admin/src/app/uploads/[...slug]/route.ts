import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    
    // slug will be e.g. ['news', 'jtkaijucjg.jpeg']
    if (!slug || slug.length < 2) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    const folder = slug[0];
    const filename = slug[1];
    
    // Target path where the file is stored on the filesystem
    const customUploadDir = process.env.MEDIA_UPLOAD_DIR;
    let filePath: string;
    
    if (customUploadDir) {
      filePath = path.join(customUploadDir, folder, filename);
    } else {
      filePath = path.join(process.cwd(), 'public', 'uploads', folder, filename);
    }

    // Verify if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found on Disk', { status: 404 });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Detect Content Type based on extension
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    let contentType = 'application/octet-stream';
    
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'svg') contentType = 'image/svg+xml';
    else if (ext === 'mp4') contentType = 'video/mp4';
    else if (ext === 'mp3') contentType = 'audio/mpeg';

    // Return file response with caching headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
