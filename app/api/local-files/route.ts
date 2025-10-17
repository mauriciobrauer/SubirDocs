import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const tmpFilesPath = path.join(process.cwd(), 'tmp-files');
    
    if (!fs.existsSync(tmpFilesPath)) {
      return NextResponse.json([]);
    }

    const files: any[] = [];
    
    // Leer todas las carpetas de números de teléfono
    const phoneFolders = fs.readdirSync(tmpFilesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const phoneFolder of phoneFolders) {
      const folderPath = path.join(tmpFilesPath, phoneFolder);
      const fileList = fs.readdirSync(folderPath);

      for (const fileName of fileList) {
        const filePath = path.join(folderPath, fileName);
        const stats = fs.statSync(filePath);

        files.push({
          phoneNumber: phoneFolder,
          fileName,
          filePath: `/tmp-files/${phoneFolder}/${fileName}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          extension: path.extname(fileName)
        });
      }
    }

    // Ordenar por fecha de creación (más recientes primero)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(files);

  } catch (error) {
    console.error('Error listando archivos locales:', error);
    return NextResponse.json({ 
      error: 'Error al listar archivos locales',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
