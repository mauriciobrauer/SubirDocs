import { NextResponse } from 'next/server';
import { Dropbox } from 'dropbox';

// Configurar fetch para Node.js
const fetch = globalThis.fetch || require('node-fetch');

export async function POST() {
  try {
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    
    if (!dropboxToken) {
      return NextResponse.json({
        success: false,
        error: 'DROPBOX_ACCESS_TOKEN no configurado'
      });
    }

    console.log('🔑 Token disponible:', !!dropboxToken);
    console.log('🔑 Token inicio:', dropboxToken.substring(0, 15) + '...');
    console.log('🔑 Token tipo:', dropboxToken.startsWith('sl.u.') ? 'Corta duración' : dropboxToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido');

    // Crear cliente Dropbox
    const dbx = new Dropbox({ 
      accessToken: dropboxToken,
      fetch: fetch
    });

    console.log('📁 Intentando crear carpeta "Mau 2" dentro de GuardaPDFDropbox...');

    try {
      // Intentar crear la carpeta "Mau 2" dentro de GuardaPDFDropbox
      const result = await dbx.filesCreateFolderV2({
        path: '/GuardaPDFDropbox/Mau 2',
        autorename: false
      });

      console.log('✅ Carpeta "Mau" creada exitosamente:', result.result);

      return NextResponse.json({
        success: true,
        message: 'Carpeta "Mau 2" creada exitosamente dentro de GuardaPDFDropbox',
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
      console.error('❌ Error creando carpeta:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Error creando carpeta en Dropbox',
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
          : 'Error desconocido al crear carpeta.'
      });
    }

  } catch (error: any) {
    console.error('❌ Error general:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      errorDetails: error.message
    });
  }
}
