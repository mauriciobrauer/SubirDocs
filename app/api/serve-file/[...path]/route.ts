import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = path.join(process.cwd(), 'tmp-files', filePath);

    // Verificar que el archivo existe
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 });
    }

    // Verificar que es un archivo (no un directorio)
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return new NextResponse('No es un archivo válido', { status: 400 });
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determinar el tipo de contenido basado en la extensión
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
