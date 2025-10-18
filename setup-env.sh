#!/bin/bash

# Script para configurar las variables de entorno de Dropbox

echo "🔧 Configurando variables de entorno para Dropbox..."

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOF
# Dropbox Configuration
DROPBOX_APP_KEY=qgi3p1bmvu85kos
DROPBOX_APP_SECRET=k8aukfp66o92g30
DROPBOX_REFRESH_TOKEN=bxk9s5tQYPoAAAAAAAAAAc-_Oneks5_ldKKlhgkNLAFT6FyPI7xtxZFHC76_i2sb

# Twilio Configuration
# Obtén estas credenciales en https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# App Configuration
NEXT_PUBLIC_APP_NAME=GuardarPDF Dropbox
EOF
    echo "✅ Archivo .env.local creado exitosamente"
else
    echo "⚠️  El archivo .env.local ya existe"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📋 Resumen de tu configuración de Dropbox:"
echo "   🔑 App Key: qgi3p1bmvu85kos"
echo "   🔐 App Secret: k8aukfp66o92g30"
echo "   🔄 Refresh Token: bxk9s5tQYPoAAAAAAAAAAc-_Oneks5_ldKKlhgkNLAFT6FyPI7xtxZFHC76_i2sb"
echo ""
echo "💡 Tu refresh token es LONG-LIVED (no expira) y se usará para renovar automáticamente los access tokens"
echo ""
echo "🚀 Ahora puedes ejecutar tu aplicación con: npm run dev"
