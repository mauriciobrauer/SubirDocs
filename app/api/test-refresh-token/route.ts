import { NextRequest, NextResponse } from 'next/server';
import TokenManager from '@/lib/token-manager';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Probando renovación de token...');
    
    // Obtener información del token
    const tokenInfo = TokenManager.getTokenInfo();
    console.log('📊 Información del token:', tokenInfo);
    
    // Forzar renovación para probar
    const newToken = await TokenManager.forceRefresh();
    
    // Obtener nueva información
    const newTokenInfo = TokenManager.getTokenInfo();
    
    return NextResponse.json({
      success: true,
      message: 'Token renovado exitosamente',
      tokenInfo: {
        before: tokenInfo,
        after: newTokenInfo,
      },
      tokenPreview: newToken ? newToken.substring(0, 20) + '...' : 'No token',
    });
    
  } catch (error: any) {
    console.error('❌ Error probando token:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
