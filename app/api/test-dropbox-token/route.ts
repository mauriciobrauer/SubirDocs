import { NextResponse } from 'next/server';
import { Dropbox } from 'dropbox';

// Configurar fetch para Node.js
const fetch = globalThis.fetch || require('node-fetch');

export async function GET() {
  try {
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    
    if (!dropboxToken) {
      return NextResponse.json({
        success: false,
        error: 'DROPBOX_ACCESS_TOKEN no configurado',
        tokenInfo: {
          exists: false,
          type: null,
          startsWithSlU: false,
          startsWithSlB: false,
          length: 0
        }
      });
    }

    // Información del token
    const tokenInfo = {
      exists: true,
      type: typeof dropboxToken,
      startsWithSlU: dropboxToken.startsWith('sl.u.'),
      startsWithSlB: dropboxToken.startsWith('sl.B'),
      length: dropboxToken.length,
      firstChars: dropboxToken.substring(0, 20) + '...',
      isShortLived: dropboxToken.startsWith('sl.u.'),
      isLongLived: dropboxToken.startsWith('sl.B')
    };

    // Probar el token haciendo una llamada simple
    const dbx = new Dropbox({ 
      accessToken: dropboxToken,
      fetch: fetch
    });

    try {
      // Intentar obtener información de la cuenta
      const accountInfo = await dbx.usersGetCurrentAccount();
      
      return NextResponse.json({
        success: true,
        message: 'Token válido y funcionando',
        accountInfo: {
          accountId: accountInfo.result.account_id,
          name: accountInfo.result.name.display_name,
          email: accountInfo.result.email
        },
        tokenInfo
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido o expirado',
        errorDetails: {
          message: error.message,
          status: error.status,
          errorType: error.error?.error?.['.tag'] || 'unknown'
        },
        tokenInfo,
        recommendation: tokenInfo.isShortLived 
          ? 'Tu token es de corta duración (sl.u.). Necesitas generar un token de larga duración (sl.B.) en Dropbox App Console.'
          : 'El token puede estar expirado o ser inválido. Verifica en Dropbox App Console.'
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Error general',
      errorDetails: error.message
    });
  }
}
