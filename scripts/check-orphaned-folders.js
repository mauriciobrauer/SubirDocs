#!/usr/bin/env node

/**
 * Script para verificar carpetas huérfanas en Dropbox
 * Uso: node scripts/check-orphaned-folders.js
 */

async function checkOrphanedFolders() {
  try {
    console.log(`🔍 === VERIFICANDO CARPETAS HUÉRFANAS EN DROPBOX ===`);
    
    // Obtener lista de usuarios actuales
    console.log(`\n📋 PASO 1: Obteniendo lista de usuarios actuales...`);
    const usersResponse = await fetch('http://localhost:3000/api/all-users');
    const usersData = await usersResponse.json();
    
    if (!usersResponse.ok) {
      throw new Error(`Error obteniendo usuarios: ${usersData.error}`);
    }
    
    console.log(`📊 Total usuarios: ${usersData.totalCount}`);
    console.log(`📊 Usuarios auto-creados: ${usersData.autoCreatedCount}`);
    
    // Listar usuarios auto-creados
    const autoUsers = usersData.users.filter(user => user.type === 'auto-created');
    console.log(`\n👥 Usuarios auto-creados:`);
    autoUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.phoneNumber})`);
    });
    
    // Verificar carpetas de usuarios auto-creados
    console.log(`\n🔍 PASO 2: Verificando carpetas de usuarios auto-creados...`);
    const folderChecks = [];
    
    for (const user of autoUsers) {
      try {
        const checkResponse = await fetch(`http://localhost:3000/api/test-dropbox-deletion?userEmail=${user.email}`);
        const checkData = await checkResponse.json();
        
        folderChecks.push({
          user: user.email,
          phoneNumber: user.phoneNumber,
          folderExists: checkData.folderExists,
          fileCount: checkData.folderExists ? checkData.folderInfo.fileCount : 0
        });
        
        console.log(`   ${user.email}: ${checkData.folderExists ? '✅ Existe' : '❌ No existe'} (${checkData.folderExists ? checkData.folderInfo.fileCount : 0} archivos)`);
      } catch (error) {
        console.log(`   ${user.email}: ❌ Error verificando - ${error.message}`);
        folderChecks.push({
          user: user.email,
          phoneNumber: user.phoneNumber,
          folderExists: false,
          fileCount: 0,
          error: error.message
        });
      }
    }
    
    // Resumen
    console.log(`\n📊 === RESUMEN ===`);
    const existingFolders = folderChecks.filter(check => check.folderExists);
    const missingFolders = folderChecks.filter(check => !check.folderExists && !check.error);
    const errorFolders = folderChecks.filter(check => check.error);
    
    console.log(`📁 Carpetas que existen: ${existingFolders.length}`);
    console.log(`❌ Carpetas que no existen: ${missingFolders.length}`);
    console.log(`⚠️ Carpetas con error: ${errorFolders.length}`);
    
    if (existingFolders.length > 0) {
      console.log(`\n📁 Carpetas existentes:`);
      existingFolders.forEach(folder => {
        console.log(`   - ${folder.user} (${folder.fileCount} archivos)`);
      });
    }
    
    if (missingFolders.length > 0) {
      console.log(`\n❌ Carpetas faltantes:`);
      missingFolders.forEach(folder => {
        console.log(`   - ${folder.user}`);
      });
    }
    
    if (errorFolders.length > 0) {
      console.log(`\n⚠️ Carpetas con error:`);
      errorFolders.forEach(folder => {
        console.log(`   - ${folder.user}: ${folder.error}`);
      });
    }
    
    // Verificar si hay carpetas huérfanas (carpetas en Dropbox sin usuario)
    console.log(`\n🔍 PASO 3: Verificando carpetas huérfanas...`);
    console.log(`ℹ️ Nota: Para verificar carpetas huérfanas, necesitarías acceso a la API de Dropbox para listar todas las carpetas`);
    console.log(`ℹ️ Por ahora, solo verificamos las carpetas de usuarios existentes`);
    
    return {
      success: true,
      totalUsers: usersData.totalCount,
      autoCreatedUsers: usersData.autoCreatedCount,
      existingFolders: existingFolders.length,
      missingFolders: missingFolders.length,
      errorFolders: errorFolders.length,
      folderChecks
    };
    
  } catch (error) {
    console.error(`❌ Error verificando carpetas: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar el script
checkOrphanedFolders();
