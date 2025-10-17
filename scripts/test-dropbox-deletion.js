#!/usr/bin/env node

/**
 * Script para probar la eliminación de carpetas de Dropbox
 * Uso: node scripts/test-dropbox-deletion.js <userEmail>
 */

const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Debes proporcionar un email de usuario');
  console.log('Uso: node scripts/test-dropbox-deletion.js <userEmail>');
  console.log('Ejemplo: node scripts/test-dropbox-deletion.js 5213334987878@whatsapp.local');
  process.exit(1);
}

async function testDropboxDeletion(userEmail) {
  try {
    console.log(`🧪 Probando eliminación de carpeta Dropbox para: ${userEmail}`);
    
    // Simular la llamada a la API local
    const response = await fetch(`http://localhost:3000/api/test-dropbox-deletion?userEmail=${encodeURIComponent(userEmail)}`);
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`📊 Resultado:`);
    console.log(`   Éxito: ${data.success}`);
    console.log(`   Mensaje: ${data.message}`);
    console.log(`   Email: ${data.userEmail}`);
    console.log(`   Carpeta existe: ${data.folderExists}`);
    
    if (data.folderInfo) {
      console.log(`   Archivos: ${data.folderInfo.fileCount}`);
      console.log(`   Tamaño total: ${data.folderInfo.totalSize} bytes`);
    }
    
    if (data.action) {
      console.log(`   Acción: ${data.action}`);
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Si es un error de conexión, probablemente el servidor no esté corriendo
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.log(`\n💡 Sugerencias:`);
      console.log(`   1. Asegúrate de que el servidor de desarrollo esté corriendo:`);
      console.log(`      npm run dev`);
      console.log(`   2. O prueba directamente en producción:`);
      console.log(`      curl "https://subir-docs.vercel.app/api/test-dropbox-deletion?userEmail=${encodeURIComponent(userEmail)}"`);
    }
    
    return null;
  }
}

// Ejecutar el script
testDropboxDeletion(userEmail);
