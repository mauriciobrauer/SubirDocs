#!/usr/bin/env node

/**
 * Script para eliminar carpetas huérfanas en Dropbox
 * Uso: node scripts/delete-orphaned-folder.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987878';

async function deleteOrphanedFolder(phoneNumber) {
  try {
    console.log(`🧹 === ELIMINANDO CARPETA HUÉRFANA ===`);
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
    
    // Formato que usa el webhook de Twilio (el real)
    const webhookFolderName = `/GuardaPDFDropbox/${phoneNumber}`;
    
    // Formato que usa la función deleteUserFolder (el incorrecto)
    const deleteFolderName = `/GuardaPDFDropbox/${phoneNumber}_at_whatsapp_local`;
    
    console.log(`📁 Carpeta real (webhook): ${webhookFolderName}`);
    console.log(`📁 Carpeta que busca deleteUserFolder: ${deleteFolderName}`);
    
    // Crear un archivo temporal para usar con DropboxAPI
    const fs = require('fs');
    const path = require('path');
    
    // Crear un archivo temporal
    const tempFile = path.join(process.cwd(), 'temp-delete.txt');
    fs.writeFileSync(tempFile, 'temp file for deletion');
    
    try {
      // Importar DropboxAPI
      const { DropboxAPI } = require('../lib/dropbox-api.ts');
      
      console.log(`\n🗑️ Eliminando carpeta real: ${webhookFolderName}`);
      
      // Usar la función deleteUserFolder pero con el formato correcto
      // Necesitamos modificar temporalmente la función o crear una nueva
      
      // Por ahora, vamos a usar el endpoint de test-dropbox-deletion
      const response = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userEmail: `${phoneNumber}@whatsapp.local`,
          folderPath: webhookFolderName // Pasar la ruta correcta
        })
      });
      
      const result = await response.json();
      console.log(`📋 Resultado:`, result);
      
      if (result.success && result.deleted) {
        console.log(`✅ Carpeta huérfana eliminada exitosamente`);
      } else if (result.success && !result.folderExists) {
        console.log(`✅ Carpeta no existe (ya fue eliminada)`);
      } else {
        console.log(`❌ Error eliminando carpeta: ${result.message}`);
      }
      
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    } finally {
      // Limpiar archivo temporal
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error en el script: ${error.message}`);
  }
}

// Ejecutar el script
deleteOrphanedFolder(phoneNumber);
