import { NextRequest, NextResponse } from 'next/server';
import { DropboxAPI } from '@/lib/dropbox-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || 'default';
    
    const files = await DropboxAPI.getFiles(userEmail);
    
    // Crear enlaces compartidos para cada archivo
    const filesWithShareLinks = await Promise.all(
      files.map(async (file) => {
        try {
          const shareUrl = await DropboxAPI.getShareLink(file.path_lower);
          return {
            ...file,
            shareUrl,
          };
        } catch (error) {
          console.error(`Error creating share link for ${file.name}:`, error);
          return {
            ...file,
            shareUrl: null,
          };
        }
      })
    );
    
    return NextResponse.json(filesWithShareLinks);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
