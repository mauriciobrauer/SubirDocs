/**
 * Token Manager para manejar la renovación automática de tokens de Dropbox
 */

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class TokenManager {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  /**
   * Obtiene un access token válido, renovándolo si es necesario
   */
  static async getValidAccessToken(): Promise<string> {
    // Verificar si el token actual es válido
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Renovar el token
    await this.refreshAccessToken();
    return this.accessToken!;
  }

  /**
   * Renueva el access token usando el refresh token
   */
  private static async refreshAccessToken(): Promise<void> {
    const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
    const appKey = process.env.DROPBOX_APP_KEY;
    const appSecret = process.env.DROPBOX_APP_SECRET;

    if (!refreshToken || !appKey || !appSecret) {
      throw new Error('Missing Dropbox credentials in environment variables');
    }

    try {
      const response = await fetch('https://api.dropbox.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: appKey,
          client_secret: appSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      // Establecer expiración con 5 minutos de margen
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;

      console.log('✅ Access token renovado exitosamente');
    } catch (error) {
      console.error('❌ Error renovando access token:', error);
      throw error;
    }
  }

  /**
   * Fuerza la renovación del token (útil para debugging)
   */
  static async forceRefresh(): Promise<string> {
    this.accessToken = null;
    this.tokenExpiry = 0;
    return await this.getValidAccessToken();
  }

  /**
   * Obtiene información del token actual
   */
  static getTokenInfo(): {
    hasToken: boolean;
    expiresIn: number;
    isValid: boolean;
  } {
    return {
      hasToken: !!this.accessToken,
      expiresIn: Math.max(0, this.tokenExpiry - Date.now()),
      isValid: this.accessToken !== null && Date.now() < this.tokenExpiry,
    };
  }
}

export default TokenManager;
