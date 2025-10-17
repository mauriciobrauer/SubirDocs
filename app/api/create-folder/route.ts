import { NextRequest, NextResponse } from 'next/server';
import { Dropbox } from 'dropbox';

// Configurar fetch para Node.js
const fetch = globalThis.fetch || require('node-fetch');

export async function POST(request: NextRequest) {
  try {
    const { folderName } = await request.json();
    
    if (!folderName) {
      return NextResponse.json({
        success: false,
        error: 'Nombre de carpeta requerido'
      }, { status: 400 });
    }

    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    
    if (!dropboxToken) {
      return NextResponse.json({
        success: false,
        error: 'DROPBOX_ACCESS_TOKEN no configurado'
      }, { status: 400 });
    }

    console.log('🔑 Token disponible:', !!dropboxToken);
    console.log('🔑 Token inicio:', dropboxToken.substring(0, 15) + '...');
    console.log('🔑 Token tipo:', dropboxToken.startsWith('sl.u.') ? 'Corta duración' : dropboxToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido');

    // Crear cliente Dropbox
    const dbx = new Dropbox({ 
      accessToken: dropboxToken,
      fetch: fetch
    });

    console.log(`📁 Intentando crear carpeta "${folderName}" dentro de GuardaPDFDropbox...`);

    try {
      // Intentar crear la carpeta dentro de GuardaPDFDropbox
      const result = await dbx.filesCreateFolderV2({
        path: `/GuardaPDFDropbox/${folderName}`,
        autorename: false
      });

      console.log(`✅ Carpeta "${folderName}" creada exitosamente:`, result.result);

      return NextResponse.json({
        success: true,
        message: `Carpeta "${folderName}" creada exitosamente dentro de GuardaPDFDropbox`,
        folderInfo: {
          id: result.result.metadata.id,
          name: result.result.metadata.name,
          path: result.result.metadata.path_lower
        },
        tokenInfo: {
          type: dropboxToken.startsWith('sl.u.') ? 'Corta duración (sl.u.)' : dropboxToken.startsWith('sl.B') ? 'Larga duración (sl.B.)' : 'Desconocido',
          length: dropboxToken.length
        }
      });

    } catch (error: any) {
      console.error(`❌ Error creando carpeta "${folderName}":`, error);
      
      return NextResponse.json({
        success: false,
        error: `Error creando carpeta "${folderName}" en Dropbox`,
        errorDetails: {
          message: error.message,
          status: error.status,
          errorType: error.error?.error?.['.tag'] || 'unknown',
          errorSummary: error.error?.error_summary || 'No summary'
        },
        tokenInfo: {
          type: dropboxToken.startsWith('sl.u.') ? 'Corta duración (sl.u.)' : dropboxToken.startsWith('sl.B') ? 'Larga duración (sl.B.)' : 'Desconocido',
          length: dropboxToken.length
        },
        recommendation: error.error?.error?.['.tag'] === 'invalid_access_token' 
          ? 'El token está expirado o es inválido. Necesitas generar un nuevo token de larga duración (sl.B.) en Dropbox App Console.'
          : error.error?.error?.['.tag'] === 'path/conflict/folder'
          ? `La carpeta "${folderName}" ya existe en GuardaPDFDropbox`
          : 'Error desconocido al crear carpeta.'
      });
    }

  } catch (error: any) {
    console.error('❌ Error general:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      errorDetails: error.message
    }, { status: 500 });
  }
}
