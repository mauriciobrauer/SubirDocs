#!/usr/bin/env node

/**
 * Script para verificar el estado del token de Dropbox
 * Uso: node scripts/check-dropbox-token.js [token]
 */

const token = process.argv[2] || process.env.DROPBOX_ACCESS_TOKEN;

if (!token) {
  console.error('❌ Error: No se proporcionó token de Dropbox');
  console.log('Uso: node scripts/check-dropbox-token.js [token]');
  console.log('O configura DROPBOX_ACCESS_TOKEN en .env.local');
  process.exit(1);
}

async function checkDropboxToken(token) {
  try {
    console.log(`🔍 Verificando token de Dropbox...`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    console.log(`📏 Longitud: ${token.length} caracteres`);
    
    // Verificar tipo de token
    if (token.startsWith('sl.u.')) {
      console.log(`⚠️  Tipo: Token de corta duración (sl.u.)`);
      console.log(`   ⏰ Duración: ~4 horas`);
      console.log(`   🔄 Se expira automáticamente`);
    } else if (token.startsWith('sl.B')) {
      console.log(`✅ Tipo: Token de larga duración (sl.B.)`);
      console.log(`   ⏰ Duración: No expira`);
      console.log(`   🔒 Recomendado para producción`);
    } else {
      console.log(`❓ Tipo: Formato desconocido`);
    }
    
    // Probar el token haciendo una llamada a la API
    console.log(`\n🧪 Probando token con API de Dropbox...`);
    
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Token válido y funcional`);
      console.log(`👤 Usuario: ${data.name.display_name}`);
      console.log(`📧 Email: ${data.email}`);
      console.log(`🆔 ID: ${data.account_id}`);
      
      // Probar crear una carpeta
      console.log(`\n📁 Probando creación de carpeta...`);
      
      const folderResponse = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: '/test_folder_verification',
          autorename: false
        })
      });
      
      if (folderResponse.ok) {
        console.log(`✅ Carpeta de prueba creada exitosamente`);
        
        // Limpiar: eliminar la carpeta de prueba
        const deleteResponse = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: '/test_folder_verification'
          })
        });
        
        if (deleteResponse.ok) {
          console.log(`🧹 Carpeta de prueba eliminada`);
        }
      } else {
        const errorData = await folderResponse.json();
        console.log(`⚠️  Error creando carpeta: ${errorData.error_summary}`);
      }
      
    } else {
      const errorData = await response.json();
      console.log(`❌ Token inválido o expirado`);
      console.log(`📋 Error: ${errorData.error_summary}`);
      
      if (errorData.error_summary.includes('expired_access_token')) {
        console.log(`\n💡 SOLUCIÓN:`);
        console.log(`   1. Ve a https://www.dropbox.com/developers/apps`);
        console.log(`   2. Selecciona tu aplicación`);
        console.log(`   3. Ve a "Permissions"`);
        console.log(`   4. Genera un nuevo token de larga duración (sl.B.)`);
        console.log(`   5. Actualiza DROPBOX_ACCESS_TOKEN en Vercel`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error verificando token: ${error.message}`);
  }
}

// Ejecutar el script
checkDropboxToken(token);
