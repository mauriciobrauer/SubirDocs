import { NextRequest, NextResponse } from 'next/server';
import TokenManager from '@/lib/token-manager';

export async function POST(request: NextRequest) {
  try {
    const { folderName } = await request.json();
    
    if (!folderName) {
      return NextResponse.json({
        success: false,
        error: 'Nombre de carpeta requerido'
      }, { status: 400 });
    }

    // Obtener access token válido usando TokenManager
    const accessToken = await TokenManager.getValidAccessToken();
    
    console.log('🔑 Token renovado exitosamente');
    console.log('🔑 Token inicio:', accessToken.substring(0, 15) + '...');
    console.log('🔑 Token tipo:', accessToken.startsWith('sl.u.') ? 'Corta duración' : accessToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido');

    console.log(`📁 Intentando crear carpeta "${folderName}" dentro de GuardaPDFDropbox...`);

    try {
      // Crear la carpeta usando la API directa de Dropbox
      const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/GuardaPDFDropbox/${folderName}`,
          autorename: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const result = await response.json();

      console.log(`✅ Carpeta "${folderName}" creada exitosamente:`, result);

      return NextResponse.json({
        success: true,
        message: `Carpeta "${folderName}" creada exitosamente dentro de GuardaPDFDropbox`,
        folderInfo: {
          id: result.metadata.id,
          name: result.metadata.name,
          path: result.metadata.path_lower
        },
        tokenInfo: {
          type: accessToken.startsWith('sl.u.') ? 'Corta duración (sl.u.)' : accessToken.startsWith('sl.B') ? 'Larga duración (sl.B.)' : 'Desconocido',
          length: accessToken.length
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
          type: accessToken.startsWith('sl.u.') ? 'Corta duración (sl.u.)' : accessToken.startsWith('sl.B') ? 'Larga duración (sl.B.)' : 'Desconocido',
          length: accessToken.length
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
