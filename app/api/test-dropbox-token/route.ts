import { NextResponse } from 'next/server';
import TokenManager from '@/lib/token-manager';

export async function GET() {
  try {
    // Verificar configuración del TokenManager
    const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
    const appKey = process.env.DROPBOX_APP_KEY;
    const appSecret = process.env.DROPBOX_APP_SECRET;
    
    if (!refreshToken || !appKey || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'Configuración de Dropbox incompleta',
        missingConfig: {
          refreshToken: !refreshToken,
          appKey: !appKey,
          appSecret: !appSecret
        }
      });
    }

    // Obtener información del TokenManager
    const tokenInfo = TokenManager.getTokenInfo();
    
    // Obtener un access token válido
    const accessToken = await TokenManager.getValidAccessToken();
    
    // Probar el token haciendo una llamada simple a la API
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const accountInfo = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Token renovado y funcionando correctamente',
        accountInfo: {
          accountId: accountInfo.account_id,
          name: accountInfo.name.display_name,
          email: accountInfo.email
        },
        tokenInfo: {
          ...tokenInfo,
          accessTokenPreview: accessToken.substring(0, 20) + '...',
          tokenLength: accessToken.length
        }
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Error en la API de Dropbox',
        errorDetails: {
          status: response.status,
          statusText: response.statusText,
          message: errorText
        },
        tokenInfo
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
