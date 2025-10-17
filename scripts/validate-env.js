#!/usr/bin/env node

/**
 * Script de validación de variables de entorno
 * Ejecuta: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Variables requeridas
const REQUIRED_VARS = {
  'DROPBOX_ACCESS_TOKEN': 'Token de acceso de Dropbox',
  'TWILIO_ACCOUNT_SID': 'Account SID de Twilio',
  'TWILIO_AUTH_TOKEN': 'Auth Token de Twilio',
  'TWILIO_PHONE_NUMBER': 'Número de teléfono de Twilio',
  'NEXT_PUBLIC_APP_NAME': 'Nombre de la aplicación'
};

// Variables opcionales
const OPTIONAL_VARS = {
  'NEXT_PUBLIC_APP_URL': 'URL de la aplicación (para producción)'
};

function validateEnvironment() {
  console.log('🔍 Validando variables de entorno...\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  // Leer archivo .env.local
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('❌ Error: No se encontró el archivo .env.local');
    console.log('💡 Solución: Copia el template: cp .env.template .env.local');
    process.exit(1);
  }
  
  // Parsear variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  let hasErrors = false;
  
  // Validar variables requeridas
  console.log('📋 Variables requeridas:');
  Object.entries(REQUIRED_VARS).forEach(([varName, description]) => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`❌ ${varName}: NO CONFIGURADO (${description})`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: Configurado`);
    }
  });
  
  // Validar variables opcionales
  console.log('\n📋 Variables opcionales:');
  Object.entries(OPTIONAL_VARS).forEach(([varName, description]) => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`⚠️  ${varName}: No configurado (${description})`);
    } else {
      console.log(`✅ ${varName}: Configurado`);
    }
  });
  
  // Validaciones específicas
  console.log('\n🔍 Validaciones específicas:');
  
  // Validar formato de token de Dropbox
  if (envVars.DROPBOX_ACCESS_TOKEN) {
    if (envVars.DROPBOX_ACCESS_TOKEN.startsWith('sl.u.')) {
      console.log('⚠️  DROPBOX_ACCESS_TOKEN: Token de corta duración detectado');
    } else if (envVars.DROPBOX_ACCESS_TOKEN.startsWith('sl.B')) {
      console.log('✅ DROPBOX_ACCESS_TOKEN: Token de larga duración detectado');
    } else {
      console.log('❓ DROPBOX_ACCESS_TOKEN: Formato de token desconocido');
    }
  }
  
  // Validar formato de Account SID
  if (envVars.TWILIO_ACCOUNT_SID && !envVars.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    console.log('❌ TWILIO_ACCOUNT_SID: Formato incorrecto (debe empezar con AC)');
    hasErrors = true;
  }
  
  // Validar número de teléfono
  if (envVars.TWILIO_PHONE_NUMBER && !envVars.TWILIO_PHONE_NUMBER.startsWith('whatsapp:')) {
    console.log('⚠️  TWILIO_PHONE_NUMBER: Debería empezar con "whatsapp:"');
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ VALIDACIÓN FALLIDA: Hay variables sin configurar');
    console.log('💡 Usa: cp .env.template .env.local y completa los valores');
    process.exit(1);
  } else {
    console.log('✅ VALIDACIÓN EXITOSA: Todas las variables están configuradas');
  }
}

// Ejecutar validación
validateEnvironment();
